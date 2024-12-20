const service = require('./../model/servicesModel');
const staff = require('./../model/staffModel');
const user = require('./../model/userModel');
const appointment = require('./../model/appointmentModel');
const feedback = require('./../model/feedbackModel')

exports.getDetails = async (req,res)=> {
    const userId = req.user.id;
    const staffEmail = req.user.email
    try {
        const staffDetails = await staff.findOne({
            where: { email: staffEmail },
            include: [
              {
                model: service,
                attributes: ['name', 'duration', 'price'], // Fetch specific service attributes
                through: { attributes: [] }, // Exclude join table attributes
              },
              {
                model: appointment,
                attributes: ['appointment_date', 'start_time'], // Fetch specific appointment attributes
                include: [
                  {
                    model: service,
                    attributes: ['name'], // Fetch service name for the appointment
                  },
                  {
                    model: user,
                    attributes: ['name'], // Fetch user name for the appointment
                  },
                ],
              },
            ],
          });

          const latestReviews = await feedback.findAll({
            limit: 10, 
            order: [['createdAt', 'DESC']], 
            include: {
              model: user, // Assuming 'user' is the associated model
              attributes: ['name'], // Include only the 'name' attribute
            }
          });

          res.status(200).json({staffDetails,latestReviews});

    }
    catch(err){
        res.status(500).json({message : 'internal server error'})
        console.log(err);
    }
}

exports.postReview = async (req,res)=> {
    const userId = req.user.id;
    try{
        const data = {
            review : req.body.review,
            userId : userId
        }
        await feedback.create(data)

        res.status(200).json({message : "thanks for the feedback"})
    }
    catch(err){
        console.log(err);
        res.status(500).json({message : 'could not post your review, please try again'})
    }
}


exports.postReply = async (req,res)=> {
  const userId = req.user.id;
  try{
    const reply = req.body.reply;
    const feedbackId = req.body.id;
    const feedbackToUpdate = await feedback.findByPk(feedbackId);

    feedbackToUpdate.reply = reply;

    await feedbackToUpdate.save();

    res.status(200).json({message : 'review posted successfully'})
  }
  catch(err){
    res.status(500).json({message : "could not post reply, try again"})
    console.log(err);
  }
}