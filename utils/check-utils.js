module.exports = {
    checkOneElementUniq: (array, newItem) => {
        let uniqElement = true;
        array.forEach(item => {
            if(item.toString() === newItem.toString()) {
                uniqElement = false;
            };
        })
        return uniqElement;
    },
};