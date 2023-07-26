export const generatePin = () => {
    return Math.floor(100000 + Math.random() * 900000);
};
