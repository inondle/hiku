const config = require('./config');
const Sequelize = require( 'sequelize' );
const db = new Sequelize( 'dev', 'dev', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	storage: config.DB_PATH,
	operatorsAliases: false
} );

const DataTypes = Sequelize.DataTypes;

const User = db.define( 'user', {
	username: DataTypes.STRING,
} );


const Message = db.define( 'message', {
	text: DataTypes.STRING({length: 500})
} );

User.hasMany(Message, {foreignKey: 'authorId'});
Message.belongsTo(User, {as: 'author'});
// TODO: Make `dev` mode env variable and make this only happen in dev mode
User.sync({force: true});
Message.sync({force: true});

module.exports = { User: User, Message: Message };