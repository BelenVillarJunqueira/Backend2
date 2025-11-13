const UsersDAO = require('../dao/users.dao');

class UsersRepository {
findByEmail(email) {
    return UsersDAO.findByEmail(email);
}

findById(id) {
    return UsersDAO.findById(id);
}

createUser(data) {
    return UsersDAO.create(data);
}

listAll() {
    return UsersDAO.listAll();
}

updateRole(uid, role) {
    return UsersDAO.updateRole(uid, role);
}

deleteById(uid) {
    return UsersDAO.deleteById(uid);
}
}


module.exports = new UsersRepository();