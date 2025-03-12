const generateRandomNumber = (length: number): number => {
    // Ensure the length is at least 1
    if (length < 1) {
        throw new Error("Length must be at least 1");
    }

    // Calculate the minimum and maximum values based on the length
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;

    // Generate a random number within the range [min, max]
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getTextColor(hexColor: string): string {
    // Remove the '#' if it's present
    if (hexColor.startsWith('#')) {
        hexColor = hexColor.slice(1);
    }

    // If in shorthand format (e.g. "03F"), convert to full form ("0033FF")
    if (hexColor.length === 3) {
        hexColor = hexColor.split('').map(char => char + char).join('');
    }

    // Parse the r, g, b values
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    // Calculate brightness using the formula:
    // brightness = (r * 299 + g * 587 + b * 114) / 1000
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Choose text color based on brightness threshold
    return brightness > 128 ? 'black' : 'white';
}

export {
    generateRandomNumber,
    getTextColor
}