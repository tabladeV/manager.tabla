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

export {
    generateRandomNumber
}