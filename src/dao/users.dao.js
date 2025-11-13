const User = require('../models/user.model');

class UsersDAO {
findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
}
findById(id) {
    return User.findById(id);
}
create(data) {
    return User.create(data);
}
listAll() {
    return User.find().select('-password');
}
updateRole(uid, role) {
    return User.findByIdAndUpdate(uid, { role }, { new: true }).select('-password');
}
deleteById(uid) {
    return User.findByIdAndDelete(uid);
}
}
module.exports = new UsersDAO();