import { validationResult, matchedData } from "express-validator";
import { Processor } from "../models/processor.model.js";
import { hashPassword } from "../utils/helpers.js";
import { ProcessorService } from "../services/processor.service.js";

export const ProcessorController = {
  async getAll(req, res) {
    try {
      const processors = await ProcessorService.getAll();
      return res.status(200).json({
        success: true,
        data: processors,
      });
    } catch (err) {
      const status = err.message.includes("don't have any") ? 404 : 500;

      return res.status(status).json({
        success: false,
        message: err.message,
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const processor = await ProcessorService.getById(id);

      return res.status(200).json({
        success: true,
        message: "Processor fetched successfully",
        data: processor,
      });
    } catch (err) {
      const status = err.message.includes("not found") ? 404 : 500;
      return res.status(status).json({
        success: false,
        message: err.message,
      });
    }
  },

  async create(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const data = matchedData(req);
      const processor = await ProcessorService.create(data);

      return res.status(201).json({
        success: true,
        message: "Processor registered successfully",
        data: processor,
      });
    } catch (err) {
      const status = err.message.includes("exists") ? 409 : 500;
      return res.status(status).json({
        success: false,
        message: err.message,
      });
    }
  },

  async createManager(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const data = matchedData(req);
      const manager = await ProcessorService.createFirstManager(data);
      return res.status(201).json({
        success: true,
        message: "Manager registered successfully",
        data: manager,
      });
    } catch (err) {
      const status = err.message.includes("exists") ? 409 : 500;
      return res.status(status).json({
        success: false,
        message: err.message,
      });
    }
  },

  async update(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { id } = req.params;
      const update = matchedData(req);
      const updated = await ProcessorService.updateById(id, update);

      res.status(200).json({
        success: true,
        message: "Processor updated successfully",
        data: updated,
      });
    } catch (err) {
      const status = err.message.includes("not found") ? 404 : 500;
      return res.status(status).json({
        success: false,
        message: err.message,
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const deleted = await ProcessorService.deleteById(id);

      return res.status(200).json({
        success: true,
        message: "Processor deleted successfully",
        data: deleted,
      });
    } catch (err) {
      const status = err.message.includes("not found") ? 404 : 500;
      return res.status(status).json({
        success: false,
        message: err.message,
      });
    }
  },
};

// export const deleteProcessorByIdHandler = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedProcessor = await Processor.findByIdAndDelete(id);

//     if (!deletedProcessor) {
//       return res.status(404).json({
//         success: false,
//         message: "Processor not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Processor deleted successfully",
//       // data: deletedProcessor,
//     });
//   } catch (error) {
//     console.error("Error deleting processor:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete processor",
//       error: error.message,
//     });
//   }
// };

// monotlithic (CONTROLLER ONLY) version vs new multi layer version(controller-service-repository)
// export const getAllProcessorsHandler = async (req, res) => {
//   try {
//     const processors = await Processor.find().select("-password").sort({
//       createdAt: -1,
//     });

//     if (processors.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "you don't have any processors.",
//         data: processors,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: processors,
//     });
//   } catch (error) {
//     console.error("Error fetching processors: ", error.message);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch processors",
//       error: error.message,
//     });
//   }
// };

// export const getProcessorByIdHandler = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const processor = await Processor.findById(id).select("-password").lean();

//     if (!processor) {
//       return res.status(404).json({
//         success: false,
//         message: "Processor not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Processor fetched successfully",
//       data: processor,
//     });
//   } catch (error) {
//     console.error("Error fetching processor", error.message);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch processor",
//       error: error.message,
//     });
//   }
// };

// export const addNewProcessorHandler = async (req, res) => {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({ success: false, errors: errors.array() });
//   }

//   const { name, email, password, role } = matchedData(req);
//   const hashedPassword = await hashPassword(password);

//   try {
//     const existingProcessor = await Processor.findOne({ email });

//     if (existingProcessor) {
//       return res.status(409).json({
//         success: false,
//         message: "Processor with this email already exists",
//       });
//     }

//     const newProcessor = await Processor.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//     });

//     const { password: _, ...safeProcessor } = newProcessor.toObject(); // store to _ variable (throwaway variable)

//     return res.status(201).json({
//       success: true,
//       message: "Processor registered successfully",
//       data: safeProcessor,
//     });
//   } catch (error) {
//     console.error("Error creating processor:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Error registering processor",
//       error: error.message,
//     });
//   }
// };

// export const addFirstManagerHandler = async (req, res) => {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       errors: errors.array(),
//     });
//   }

//   const { name, email, password } = req.body;
//   const hashedPassword = await hashPassword(password);

//   try {
//     const existingProcessor = await Processor.findOne({ email });

//     if (existingProcessor) {
//       return res.status(409).json({
//         success: false,
//         message: "Processor with this email already exists",
//       });
//     }

//     const newManager = await Processor.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: "manager",
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Processor registered successfully",
//       data: newManager,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error registering manager",
//     });
//   }
// };

// export const editProcessorByIdHandler = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     if (updates.password) {
//       updates.password = await hashPassword(updates.password);
//     }

//     const updatedProcessor = await Processor.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     }).select("-password");

//     if (!updatedProcessor) {
//       return res.status(404).json({
//         success: false,
//         message: "Processor not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Processor updated successfully",
//       data: updatedProcessor,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to update processor",
//       error: error.message,
//     });
//   }
// };
