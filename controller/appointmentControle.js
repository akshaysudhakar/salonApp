const service = require('./../model/servicesModel');
const staff = require('./../model/staffModel');
const appointment = require('./../model/appointmentModel');
const user = require('./../model/userModel');

const { DateTime } = require('luxon');
const sib = require("sib-api-v3-sdk");
const cron = require('node-cron');

require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const webhook = process.env.WEB_HOOK;

const client = sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY

exports.bookAppointment = async (req,res)=> {
    const userId = req.user.id;
    const serviceName = req.body.serviceName;
    const servicePrice = req.body.servicePrice;
    const date = req.body.date;
    const timeSlot = req.body.timeSlot;
    const staffName = req.body.stylistName;
    try {

        const stylist = await staff.findOne({where : {name : staffName}});
        const serviceSelected = await service.findOne({where : {name : serviceName}});

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
              price_data: {
                currency: 'inr',
                product_data: {
                  name: serviceName,
                },
                unit_amount: servicePrice*100, 
              },
              quantity: 1,
            }],
            mode: 'payment',
            success_url: `http://localhost:3000/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: 'http://localhost:3000/cancel.html',
            invoice_creation: {
                enabled: true, 
              },
          });

          const time = DateTime.fromFormat(timeSlot, "h:mm a");
          const endTime = time.plus({ hours: 1 });

          const startFormatted = time.toFormat("HH:mm:ss");
          const endFormatted = endTime.toFormat("HH:mm:ss");

          const data = {
            appointment_date : date,
            start_time : startFormatted,
            end_time : endFormatted,
            sessionId : session.id,
            userId : userId,
            staffId : stylist.id,
            serviceId : serviceSelected.id
          }

          await appointment.create(data);

          console.log('look for webhook?')

          res.status(200).json({ sessionId: session.id });

    }
    catch(err){
        res.status(500).json(err);
        console.log(err)
    }
}


exports.cancel = async (req,res)=> {
  const userId = req.user.id;
  const appointmentId = req.headers.appid;
  console.log("lsldlslfssd",appointmentId);
  try{
     const appointmentToBeDeleted = await appointment.findByPk(appointmentId);

     await appointmentToBeDeleted.destroy();

     return res.status(200).json({message : "appointment deleted successfully"});
  }
  catch(err){
    console.log(err);
    res.status(500).json({message : 'internal server error'})
  }
}

exports.paymentHandler = async (req, res) => {
    console.log('entered webhook')
    const sig = req.headers['stripe-signature']; // Stripe signature header
    let event;
    console.log(req.body);
  
    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhook);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object;
        console.log('Payment checkout was successful:', checkoutSession);
  
        // Retrieve the invoice related to the session
        const invoiceId = checkoutSession.invoice;
        
        if (invoiceId) {
          try {
            const invoice = await stripe.invoices.retrieve(invoiceId);
            const invoiceUrl = invoice.hosted_invoice_url; // The URL to view the invoice online

            await updateAppointment(checkoutSession.id, checkoutSession.status,invoiceUrl);
  
            console.log('Invoice URL:', invoiceUrl);
            // Optionally, you can send the invoice URL to the user or store it in your database
          } catch (error) {
            console.error('Error fetching invoice:', error);
          }
        }

  
        break;
  
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  
    // Return a response to acknowledge receipt of the event
    res.sendStatus(200);
  };


  

  async function updateAppointment(sessionId,status,invoiceUrl){     
    const transEmailApi = new sib.TransactionalEmailsApi();
    try{
    const Appointment = await appointment.findOne({where: {sessionId : sessionId},
      include: [
        {
          model: staff,
          attributes: ['name'], 
        },
        {
          model: user,
          attributes: ['email'], 
        },
      ]
    });

    const uEmail = Appointment.user.email;

    const sender = {
      email : "akshayvisionary@gmail.com"
    }
  const recievers = [
      {
          email : uEmail
      }
  ]

    if(Appointment){
      Appointment.payment = true;
      await Appointment.save();
    }

    const email =await transEmailApi.sendTransacEmail({
      sender,
      to : recievers,
      subject : 'hello there!!!',
      htmlContent : 
      `<html>
      <body>
        <h1>ypur appointment has been scheduled</h1>
        <p> your appointment details : 
        Date : ${Appointment.appointment_date}
        Time : ${Appointment.start_time}
        Stylist: ${Appointment.staff.name}
        <a href =${invoiceUrl}>click here to download invoice</a>
        </p>
      </body>
    </html>`
  })

  scheduleReminders(Appointment.appointment_date, Appointment.start_time,recievers);

    }
    catch(err){
      console.log(err);
    }
  }




  function scheduleReminders(appointmentDate, appointmentTime,recievers) {
    console.log('schedule reminder called')
    // Combine date and time to create a full Date object
    const [hours, minutes,seconds] = appointmentTime.split(':'); // assuming appointmentTime is in HH:MM format
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(hours);
    appointmentDateTime.setMinutes(minutes);
  
    const reminderTime = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000);

    const reminderHours = reminderTime.getHours();
    const reminderMinutes = reminderTime.getMinutes();

    const cronPattern = `${reminderMinutes} ${reminderHours} * * *`;
  
    cron.schedule(cronPattern, () => {
      sendReminderEmail(recievers);
    });
  }


  function sendReminderEmail(recievers) {
    console.log('send email called')
    const transEmailApi = new sib.TransactionalEmailsApi();
    
    // Assuming you have the appointment details saved, such as user email and appointment information
    const sender = {
      email: 'akshayvisionary@gmail.com',
    };
  
    const emailEeceivers = recievers;
  
    // Send the reminder email
    transEmailApi.sendTransacEmail({
      sender,
      to: emailEeceivers,
      subject: 'Reminder: Your Appointment is in 30 Minutes',
      htmlContent: `
        <html>
        <body>
          <h1>Reminder: Your Appointment is in 30 Minutes</h1>
          <p>Just a reminder, your appointment is coming up in 30 minutes!</p>
          <p>We look forward to seeing you!</p>
        </body>
        </html>
      `,
    }).then(response => {
      console.log('Reminder email sent:', response);
    }).catch(error => {
      console.error('Error sending reminder email:', error);
    });
  }
  
