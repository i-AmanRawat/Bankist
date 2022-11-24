'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2022-11-20T14:11:59.604Z',
    '2022-11-16T17:01:17.194Z',
    '2022-11-18T23:36:17.929Z',
    '2022-11-21T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const formatMovementDate = function (typeDate, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 24 * 60 * 60));
  const daysPassed = calcDaysPassed(new Date(), new Date(typeDate));

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const now = new Date(typeDate); //the date on which exchange was done
  // const date = `${now.getDate()}`.padStart(2, '0');
  // const month = `${now.getMonth() + 1}`.padStart(2, '0');
  // const year = now.getFullYear();
  // return `${date}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(typeDate);
};

const formatCurr = function (amount, locale, currency) {
  const option = {
    style: 'currency',
    currency,
    // currency: currency,
  };
  return new Intl.NumberFormat(locale, option).format(amount);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (amount, i) {
    const type = amount > 0 ? 'deposit' : 'withdrawal';
    const typeDate = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(typeDate, acc.locale);

    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formatCurr(
      amount,
      acc.locale,
      acc.currency
    )}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce(
    (accumulator, currentElement, index) => accumulator + currentElement,
    0
  );
  labelBalance.textContent = formatCurr(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurr(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + Math.abs(mov), 0);
  labelSumOut.textContent = formatCurr(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * acc.interestRate) / 100)
    .filter(mov => mov >= 1) //exclude less than 1 interest value
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurr(interest, acc.locale, acc.currency);
};

const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(function (word) {
        return word[0];
      })
      .join('');
  });
};
createUserNames(accounts);

const updateUI = function (acc) {
  //display balance
  calcDisplayBalance(acc);

  //display summary
  calcDisplaySummary(acc);

  //display movements
  displayMovements(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(timeLimit / 60)).padStart(2, '0');
    const sec = String(timeLimit % 60).padStart(2, '0');
    //update the time in ui each second
    labelTimer.textContent = `${min}:${sec}`;
    //on zero log out
    if (timeLimit === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 100;
      labelWelcome.textContent = `Welcome back, ${
        currentAccount.owner.split(' ')[0]
      }`;
    }
    //decrease time limit every sec
    timeLimit--;
  };

  //time limit
  let timeLimit = 100;

  //display time
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

let currentAccount, timer;

// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  //fetching account
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  ); // inputLoginUsername.inputLoginPin;
  //check credentials
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //display welcome message
    labelWelcome.textContent = `Log in to get started`;

    //display date
    // const now = new Date();
    // const date = `${now.getDate()}`.padStart(2, '0');
    // const month = `${now.getMonth() + 1}`.padStart(2, '0');
    // const year = now.getFullYear();
    // const hours = `${now.getHours()}`.padStart(2, '0');
    // const mins = `${now.getMinutes()}`.padStart(2, '0');
    // labelDate.textContent = `${date}/${month}/${year}, ${hours}:${mins}`;
    const now = new Date();
    labelDate.textContent = `${new Intl.DateTimeFormat(
      currentAccount.locale
    ).format(now)}`;

    //delete input info
    inputLoginUsername.value = inputLoginPin.value = ''; // similar to: a=b=c;

    //display ui
    containerApp.style.opacity = 100;

    //starting timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    //updating UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault(); //to avoid the bydefault reloading of form bcz we are using form tag
  const reciever = accounts.find(acc => acc.username === inputTransferTo.value);
  const transferAmount = Number(inputTransferAmount.value);
  //clear input info
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    transferAmount > 0 &&
    currentAccount.balance >= transferAmount &&
    reciever &&
    currentAccount.username !== reciever.username
  ) {
    //doing the transfer
    currentAccount.movements.push(-transferAmount);
    reciever.movements.push(transferAmount);

    currentAccount.movementsDates.push(new Date().toISOString());
    reciever.movementsDates.push(new Date().toISOString());

    //updating the ui
    updateUI(currentAccount);

    //resetting the timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanAmount = Math.floor(inputLoanAmount.value);
  inputLoanAmount.value = '';
  if (
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov >= loanAmount * 0.1)
  ) {
    //checking is there any amount which is 10% of loan amount
    //giving loan
    setTimeout(() => {
      currentAccount.movements.push(loanAmount);
      currentAccount.movementsDates.push(new Date().toISOString());

      //update UI now
      updateUI(currentAccount);

      //resetting the timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  //check credentials
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    //clear input fields
    inputCloseUsername.value = inputClosePin.value = '';
    //access which index element to be deleted using findIndex() method
    const deleteIndex = accounts.findIndex(acc => acc.username === confirmUser);
    //deleting the element using the index via splice() method
    accounts.splice(deleteIndex, 1);
    //hide the UI again
    containerApp.style.opacity = 0;
  }
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
``;
