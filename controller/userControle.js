const bcrypt = require('bcrypt');

const service = require('./../model/servicesModel');
const appointment = require('./../model/appointmentModel');
const staff = require('./../model/staffModel');


const user = require('./../model/userModel')
const tokenVerify = require("../util/helpers")

exports.signUp = async (req,res,next)=>{
    const data = req.body;
    console.log(req.body)
    try{
        const hashedPassword = await bcrypt.hash(data.password,10);

        data.password = hashedPassword

        const newUser = await user.create(data);

        res.status(200).json({message:'successfully created account'})

    }catch(err){
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.json({ message: "an account already exists with this credentials" });
        } else {
            console.error('Error during user creation:', err);

            res.status(500).json({ message: "An error occurred while adding the user." });
        }
    }
}

exports.login = async (req,res,next) =>{
    const data = req.body
    try{ 
        const userToLogin = await user.findOne({where:{email : data.email}})

        if(!userToLogin){
            return res.status(404).json({message : "user not found"})
        }

        const ismatch = await bcrypt.compare(data.password,userToLogin.password)
        if(ismatch){
            const userToken = tokenVerify.generateToken(userToLogin.id,userToLogin.email)
            const dataToSend = {message : "login successful" , token : userToken, name :userToLogin.name};
            if(userToLogin.isAdmin === true){
                dataToSend.isAdmin = true;
            }
            return res.status(200).json(dataToSend)   
        }
        else{
            res.status(401).json({message : "incorrect password"})
        }
    }
    catch(err){
        console.log(err)
        res.status(500).json({message : "server error, please try again"})
    }
}

exports.getDetails = async (req,res)=> {
    const userId = req.user.id;
    try{
        const availableServices = await service.findAll();

        const userAppointments = await appointment.findAll({
            where: { userId }, 
            include: [
              {
                model: staff, 
                attributes: ['name'],
              },
              {
                model: service, 
                attributes: ['name', 'price', 'duration'], 
              },
            ],
          });

          return res.status(200).json({services : availableServices,userAppointments : userAppointments});
    }
    catch(err){
        console.log(err)
    }
}

exports.getStylist = async (req,res)=> {
    const userId = req.user.id;
    const serviceName = req.body.serviceName;
    try {
        const staffsAvailable = await  service.findOne({
            where : {name : serviceName},
            include: [
                {
                    model: staff,
                    attributes: ['name'], // Select only the 'name' field from the staff model
                    through: { attributes: [] }, // Exclude junction table fields
                },
            ],
            attributes: [],
    });

        return res.status(200).json({staffsAvailable,})

    }
    catch(err){
        console.log(err);
        return res.status(500).json(err)

    }
}

exports.getbookedSlots = async (req,res)=> {
    const userId = req.user.id;
    const stylist = req.body.stylist;
    const date = req.body.date;
    try{
        const stylistSelected = await staff.findOne({where : { name : stylist}});

        const bookedSlots = await appointment.findAll({
            where: {
                staffId: stylistSelected.id,
                appointment_date: date 
            },
            attributes: ['start_time'], // Return
        });

        res.status(200).json(bookedSlots);
    }
    catch(err){
        res.status(500).json(err)
        console.log(err);
    }
}