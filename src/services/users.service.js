const UsersRepository = require('../repositories/users.repository');

class UsersService {
    getAllUsers() {
    return UsersRepository.listAll();
}

updateUserRole(uid, role) {
    return UsersRepository.updateRole(uid, role);
}

deleteUser(uid) {
    return UsersRepository.deleteById(uid);
}
}

module.exports = new UsersService();