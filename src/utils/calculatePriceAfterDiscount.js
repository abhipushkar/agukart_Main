export function calculatePriceAfterDiscount(type, value, amount) {
    let discount = 0;
    if (type === "flat") {
        discount = Math.min(value, amount);
    } else if (type === "percentage") {
        if (value < 0 || value > 100) {
            throw new Error("Percentage value must be between 0 and 100.");
        }
        discount = (value / 100) * amount;
    } else {
        throw new Error("Invalid discount type. Must be 'fixed' or 'percentage'.");
    }
    const finalPrice = amount - discount;

    return finalPrice;
}
