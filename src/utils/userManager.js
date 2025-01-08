const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../../storage/users.json');

function getUsers() {
    try {
        const data = fs.readFileSync(usersPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler usuários:', error);
        return [];
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar usuários:', error);
        return false;
    }
}

function saveUser(userData) {
    const users = getUsers();
    const existingUserIndex = users.findIndex(user => user.id === userData.id);

    if (existingUserIndex !== -1) {
        users[existingUserIndex] = userData;
    } else {
        users.push(userData);
    }

    return saveUsers(users);
}

function deleteUser(userId) {
    const users = getUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    return saveUsers(filteredUsers);
}

function getUserById(userId) {
    const users = getUsers();
    return users.find(user => user.id === userId);
}

module.exports = {
    getUsers,
    saveUser,
    deleteUser,
    getUserById
}; 