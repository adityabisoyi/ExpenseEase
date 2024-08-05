const notNull = (str) => {
    if (str.trim() === "") return false;

    return true;
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    const passRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/;
    return passRegex.test(password);
};

const convertAccountNumber = (accountNumber) => {
    return accountNumber.padStart(14, 0)
}

function addDaysToDate(criteria, days) {
    const currentDate = new Date();
    if(criteria === "D") {
        // console.log("In D");
        currentDate.setDate(currentDate.getDate() + days);
        return currentDate;
    } else if(criteria === "M") {
        // console.log("In M");
        currentDate.setMonth(currentDate.getMonth() + days);
        return currentDate;
    } else if(criteria === "Y") {
        // console.log("In M");
        currentDate.setFullYear(currentDate.getFullYear() + days);
        return currentDate
    } else {
        console.log("Not a valid criteria");
    }
}

export { 
    notNull, 
    validateEmail, 
    validatePassword,
    convertAccountNumber,
    addDaysToDate
};
