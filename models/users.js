module.exports = function(sequelize,DataTypes){
    var users = sequelize.define("users", {

        username: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true
        },

        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },

        password: {
            type: DataTypes.STRING(60),
            allowNull: false
        }


    });

    // Class Method
users.associate = function (models) {

    users.hasMany(models.Post, {
    onDelete: "cascade"
    });
    
};


return users;


}
