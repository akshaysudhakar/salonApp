const service = require('./../model/servicesModel');
const staff = require('./../model/staffModel');
const appointment = require('./../model/appointmentModel');





exports.addService = async (req,res)=> {
    console.log('request body', req.body);
    const userId = req.user.id;
    const data =  {
        name : req.body.name,
        price: req.body.price,
        duration : req.body.duration,
      }
    const staff = req.body.staff;
    try{
        const newService = await service.create(data);

        if (Array.isArray(staff)) {
            const staffPromises = staff.map(async (staffName) => {
                const [staffMember] = await staff.findOrCreate({
                    where: { name: staffName },
                });
                return staffMember;
            });

        const staffMembers = await Promise.all(staffPromises);

        await newService.addStaff(staffMembers);
        }

        return res.status(200).json({message:'added a new service successfully'});
    }
    catch(err){
        console.log(err);
    }
}

exports.addStaff = async (req,res)=> {
    console.log('request body', req.body);
    const userId = req.user.id;
    const data =  {
        name : req.body.name,
        email : req.body.email
      }
    const services = req.body.services;
    try{
        const newStaff = await staff.create(data);

        if (Array.isArray(services)) {
            const servicePromises = services.map(async (serviceName) => {
                const [serviceDetail] = await service.findAll({
                    where: { name: serviceName },
                });
                return serviceDetail.id;
            });

        const serviceDetails = await Promise.all(servicePromises);
        console.log(serviceDetails);

        await newStaff.addService(serviceDetails);
        }

        return res.status(200).json({message:'added a new staff successfully'});
    }
    catch(err){
        console.log(err);
    }
}

exports.getDetails = async (req,res)=> {
    const userId = req.user.id;
    try{
        const availableServices = await service.findAll();

        const availableStaff = await staff.findAll();

        const Appointments = await appointment.findAll();

        return res.status(200).json({services : availableServices,Appointments : Appointments, availableStaff : availableStaff});
    }
    catch(err){
        console.log(err)
    }
}