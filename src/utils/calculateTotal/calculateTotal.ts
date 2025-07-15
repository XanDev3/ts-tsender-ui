
export default function calculateTotal(input: string): number  {
    if (!input) return 0;
    // Split by comma or newline, trim, filter out empty, and sum
     return input
        .split(/[\n,]+/)
        .map((str) => str.trim()) // Trim whitespace from each value
        .filter((str) => str.length > 0) // Filter out empty strings
        .map(str => parseFloat(str)) // Convert to floating numbers
        .filter((num) => !isNaN(num)) // Filter out non-number values
        .reduce((sum, num) => sum + num, 0); // Sum the numbers
}