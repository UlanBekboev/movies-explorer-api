/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const NotFoundError = require('./errors/not-found-err');
const auth = require('./middlewares/auth');
const { login, createUser, logout } = require('./controllers/users');
const rootRouter = require('./routes/index');
const { SERVER_PORT, DB } = require('./utils/config');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { signIn, signUp } = require('./middlewares/validations');
const errorHandler = require('./middlewares/errorHandler');

const corsOptions = {
  origin: [
    'https://praktikum.tk',
    'http://praktikum.tk',
    'http://localhost:3001',
    'https://localhost:3001',
    'http://moviestar.nomoredomainsrocks.ru',
    'https://moviestar.nomoredomainsrocks.ru',
  ],
  credentials: true,
  maxAge: 60,
};

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(requestLogger);

app.use(cookieParser());

app.post('/signin', signIn, login);
app.post('/signup', signUp, createUser);
app.post('/signout', auth, logout);

app.use(auth);
app.use('/', rootRouter);

app.use(errorLogger);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});
app.use(errors());
app.use(errorHandler);

app.listen(SERVER_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${SERVER_PORT}`);
});
