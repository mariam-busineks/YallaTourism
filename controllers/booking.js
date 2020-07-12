const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Tour = require('../models/Tour');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// @desc      BOOK TOUR
// @route     GET /api/v1/booking/checkout-session/:tourID
// @access    Public
exports.getCheckoutSession = asyncHandler(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourID);

    if (!tour) {
        return next(
            new ErrorResponse(`Tour with id of ${req.params.id} not found`, 404)
        );
    }
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [
                    `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
                ],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        data: session
    });
});