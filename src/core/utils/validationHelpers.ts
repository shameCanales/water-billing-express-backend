export const capitalizeFirstLetter = (value: string) => {
  if (typeof value !== "string") return value;

  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
