
module.exports = {
    addNewElement: (array, newItem) => {
        let uniqElement = false;
        array.forEach(item => {
            if(item.toString() === newItem.toString()) {
                uniqElement = true;
            };
        })
        if(uniqElement) {
            return array;
        }
        return [...array, newItem]
    },
    addNewArray: (array, newArray) => {
        const result = [];
        newArray.forEach((newItem) => {
            let uniqElement = true;
            array.forEach(item => {
                if(item.toString() === newItem.toString()) {
                    uniqElement = false;
                };
            })
            if(uniqElement) {
                result.push(newItem);
            }
        })
        return [...array, ...result]
    }
};