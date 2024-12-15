const service = require('./../model/servicesModel');
const staff = require('./../model/staffModel');
const appointment = require('./../model/appointmentModel');
const user = require('./../model/userModel');

const { DateTime } = require('luxon');

require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const webhook = process.env.WEB_HOOK;

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

          res.status(200).json({ sessionId: session.id });

    }
    catch(err){
        res.status(500).json(err);
        console.log(err)
    }
}


exports.paymentHandler = async (req, res) => {
    console.log('entered webhook')
    const sig = req.headers['stripe-signature']; // Stripe signature header
    let event;
  
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
  
            console.log('Invoice URL:', invoiceUrl);
            // Optionally, you can send the invoice URL to the user or store it in your database
          } catch (error) {
            console.error('Error fetching invoice:', error);
          }
        }

        await updateUser(checkoutSession.id, checkoutSession.status);
  
        break;
  
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  
    // Return a response to acknowledge receipt of the event
    res.sendStatus(200);
  };
  