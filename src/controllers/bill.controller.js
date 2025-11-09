export const getAllBillsHandler = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate({
        path: "connection",
        populate: {
          path: "consumer",
          select: "name email mobileNumber address",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: `bills retrieved successfully`,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bills",
      // error: error.message,
    });
  }
};

export const addBillToConnectionHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const {
      connection,
      monthOf,
      dueDate,
      meterReading: rawMeterReading,
      chargePerCubicMeter: rawCharge = BILLING_SETTINGS.chargePerCubicMeter,
    } = req.body;

    const meterReading = Number(rawMeterReading);
    const chargePerCubicMeter = Number(rawCharge);

    if (!Number.isFinite(meterReading) || meterReading < 0) {
      return res.status(400).json({
        success: false,
        message: "meterReading must be a non-negative number",
      });
    }

    if (!Number.isFinite(chargePerCubicMeter) || chargePerCubicMeter < 0) {
      return res.status(400).json({
        success: false,
        message: "chargePerCubicMeter must be a non-negative number",
      });
    }

    // normalize monthOf to first day of month at 00:00:00 UTC
    const parsedMonth = new Date(monthOf);
    if (isNaN(parsedMonth)) {
      return res.status(400).json({
        success: false,
        message: "Invalid monthOf date",
      });
    }

    const monthDate = new Date(
      Date.UTC(
        parsedMonth.getUTCFullYear(),
        parsedMonth.getUTCMonth(),
        1,
        0,
        0,
        0,
        0
      )
    );

    // parse dueDate
    const dueDateObj = new Date(dueDate); // duedate = "2025-11-01" || "November 2025". convert to date object
    if (isNaN(dueDateObj)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dueDate",
      });
    }

    // Ensure connection exists
    const findConnection = await Connection.findById(connection).populate(
      "consumer",
      "name email mobileNumber"
    );
    if (!findConnection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    // prevent duplicate month bills
    const existingBill = await Bill.findOne({
      connection,
      monthOf: monthDate,
    }).lean();

    if (existingBill) {
      return res.status(409).json({
        success: false,
        message: `A bill for this period already exists for this connection`,
      });
    }

    // find the last bill for this connection
    const lastBill = await Bill.findOne({ connection })
      .sort({ monthOf: -1 })
      .lean();

    // compute consumed units
    let lastReading = lastBill ? Number(lastBill.meterReading) : 0;
    const consumedUnits = meterReading - lastReading;

    if (!Number.isFinite(consumedUnits) || consumedUnits < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Current meter reading cannot be lower than previous recorded reading",
      });
    }

    // compute amount
    const amount = consumedUnits * chargePerCubicMeter;

    // create a save new bill
    const newBill = await Bill.create({
      connection,
      monthOf: monthDate,
      dueDate: dueDateObj,
      meterReading,
      chargePerCubicMeter,
      consumedUnits,
      amount,
      status: "unpaid",
    });

    // populate connection + consumer for response
    const populatedbill = await Bill.findById(newBill._id)
      .populate({
        path: "connection",
        populate: { path: "consumer", select: "name email mobileNumber" },
      })
      .lean();

    res.status(201).json({
      success: true,
      message: "Bill added successfully",
      data: populatedbill,
    });
  } catch (error) {
    console.error("Error creating bill: ", error);

    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A bill for this connection and month already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add bill",
    });
  }
};

export const getBillsByConnectionIdHandler = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connectionExists = await Connection.exists({ _id: connectionId });
    if (!connectionExists) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    const bills = await Bill.find({ connection: connectionId })
      .populate({
        path: "connection",
        populate: {
          path: "consumer",
          select: "name email mobileNumber address",
        },
      })
      .sort({ createdAt: -1 });

    if (!bills.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: "No bills found for this connection",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      count: bills.length,
      message: `${bills.length} bills retrieved successfully.`,
      data: bills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bills for this connection",
      error: error.message,
    });
  }
};

export const updateBillInformationByIdHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { billId } = req.params;
    const updates = req.body;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "bill not found",
      });
    }

    const updatedBill = await Bill.findByIdAndUpdate(billId, updates, {
      new: true,
      runValidators: true,
    }).populate({
      path: "connection",
      populate: {
        path: "consumer",
        select: "name email mobileNumber",
      },
    });

    res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      data: updatedBill,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error: Failed to update the bill",
    });
  }
};

export const updateBillStatusByIdHandler = async (req, res) => {
  try {
    const { billId } = req.params;
    const { status } = req.body;

    //validate status value
    const allowedStatuses = ["paid", "unpaid", "overdue"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    const existingBill = await Bill.findById(billId).lean();

    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    if (existingBill.status === status) {
      return res.status(200).json({
        success: true,
        message: `Bill is already marked as ${status}`,
        data: existingBill,
      });
    }

    // set paidAt date when marked as paid
    const updateData = {
      status,
      paidAt: status === "paid" ? new Date() : null,
    };

    const updatedBill = await Bill.findByIdAndUpdate(billId, updateData, {
      new: true,
      runValidators: true,
    }).populate({
      path: "connection",
      populate: {
        path: "consumer",
        select: "name email mobileNumber address",
      },
    });

    res.status(200).json({
      success: true,
      message: "Bill status updated successfully",
      data: updatedBill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update bill status",
      error: error.message,
    });
  }
};

export const deleteBillById = async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    await bill.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Successfully deleted bill and I don't know why would you want to delete it",
      data: {
        _id: bill.id,
        connection: bill.connection,
        amount: bill.amount,
        monthOf: bill.monthOf,
      },
    });
  } catch (error) {
    console.error("Error deleting bill:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete bill",
      error: error.message,
    });
  }
};
