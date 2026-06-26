const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(compression());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true }));

// Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/routes', require('./routes/route.routes'));
app.use('/api/v1/vehicles', require('./routes/vehicle.routes'));
app.use('/api/v1/drivers', require('./routes/driver.routes'));
app.use('/api/v1/fares', require('./routes/fare.routes'));
app.use('/api/v1/bookings', require('./routes/booking.routes'));
app.use('/api/v1/blogs', require('./routes/blog.routes'));
app.use('/api/v1/testimonials', require('./routes/testimonial.routes'));
app.use('/api/v1/contact', require('./routes/contact.routes'));
app.use('/api/v1/cms', require('./routes/cms.routes'));
app.use('/api/v1/seo', require('./routes/seo.routes'));
app.use('/api/v1/settings', require('./routes/settings.routes'));
app.use('/api/v1/dashboard', require('./routes/dashboard.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use("/", (req, res) => {
    res.send("Welcome to the API");
});

app.all('*', (req, res, next) => next(new AppError(`Route ${req.originalUrl} not found`, 404)));
app.use(errorHandler);

module.exports = app;
