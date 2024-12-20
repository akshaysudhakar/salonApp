const express = require('express')
const path = require('path');
const http = require('http');
const fs = require('fs');

const app = express();

const sequelize = require('./util/database');

const user = require('./model/userModel');
const services = require('./model/servicesModel');
const staff = require('./model/staffModel');
const appointment =  require('./model/appointmentModel');
const feedback = require('./model/feedbackModel');

const userRoute = require('./route/userRoute');
const adminRoute = require('./route/adminRoute');
const appointmentRoute = require('./route/appointmentRoute');
const staffRoute = require('./route/staffRoute');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/user',userRoute);
app.use('/admin',adminRoute);
app.use('/appointment',appointmentRoute);
app.use('/staff',staffRoute);

services.belongsToMany(staff, { through: 'ServiceStaff', foreignKey: 'serviceId' });
staff.belongsToMany(services, { through: 'ServiceStaff', foreignKey: 'staffId' });

appointment.belongsTo(user, { foreignKey: 'userId' }); 
user.hasMany(appointment, { foreignKey: 'userId' }); 

appointment.belongsTo(staff, { foreignKey: 'staffId' }); 
staff.hasMany(appointment, { foreignKey: 'staffId' })

appointment.belongsTo(services, { foreignKey: 'serviceId' });
services.hasMany(appointment, { foreignKey: 'serviceId' });

feedback.belongsTo(user, { foreignKey: 'userId' }); 
user.hasMany(feedback, { foreignKey: 'userId' }); 

sequelize.sync()
//sequelize.sync({force : true})
  .then(() => {
    console.log('Database synced successfully');

    // Create HTTPS server
    const server = http.createServer(app);

    server.listen(3000, ()=> {
        console.log('server is listening');
    })
}).catch(err=> {
    console.log('error syncing the database',err)
})