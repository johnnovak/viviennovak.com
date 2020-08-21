function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var fieldNames = ['name', 'email', 'message'];
var inputElements = {
  'name': document.querySelector('#phone-input'),
  'email': document.querySelector('#country-input'),
  'message': document.querySelector('#comments-input')
};
var errorElements = {
  'name': document.querySelector('#phone-error'),
  'email': document.querySelector('#country-error'),
  'message': document.querySelector('#comments-error')
};
var validateAttr = 'data-validate';
var validClass = 'valid';
var debounceDelayMs = 1000;
var body = document.querySelector('body');
var sendButton = document.querySelector('#submit');
var contactModal = document.getElementById('contact-modal');
var contactModalMsg = document.querySelector('#contact-modal > div > p');
var closeModalButton = document.getElementById('close-modal');
var postUrl = 'https://cxs5fa9xtc.execute-api.us-east-2.amazonaws.com/default/mailfwd';
var formFields = fieldNames.map(function (n) {
  return inputElements[n];
});
var sending = false;

function isValidateField(el) {
  return el.getAttribute(validateAttr) == '1';
}

function setValidateField(el) {
  el.setAttribute(validateAttr, '1');
}

function getFormData() {
  var data = {};
  fieldNames.forEach(function (name) {
    var el = inputElements[name];
    data[name] = {
      text: el.value,
      validate: isValidateField(el)
    };
  });
  return data;
}

var debounce = function debounce(callback) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : debounceDelayMs;
  var timeoutId;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      timeoutId = null;
      callback.apply(void 0, args);
    }, delay);
  };
};

function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function validateFormData(data) {
  function setError(fieldName, msg) {
    result.valid = false;
    result.errors[fieldName] = msg;
  }

  var result = {
    errors: {}
  };
  fieldNames.forEach(function (name) {
    return setError(name, '');
  });
  result.valid = true;
  var numFieldsValidated = 0;

  if (data.name.validate) {
    numFieldsValidated++;

    if (data.name.text.trim() == '') {
      setError('name', 'Please enter your name');
    } else if (data.name.text.length < 2) {
      setError('name', 'Your name must be at least 2 characters long');
    }
  }

  if (data.email.validate) {
    numFieldsValidated++;

    if (data.email.text.trim() == '') {
      setError('email', 'Please enter your email address');
    } else if (!validateEmail(data.email.text)) {
      setError('email', 'Please enter a valid email address');
    }
  }

  if (data.message.validate) {
    numFieldsValidated++;

    if (data.message.text.trim() == '') {
      setError('message', 'Please enter your message');
    } else if (data.message.text.length < 50) {
      setError('message', 'Your message must be at least 50 characters long');
    }
  }

  result.allFieldsValidated = numFieldsValidated == 3;
  return result;
}

function updateValidationErrors(result) {
  Object.entries(result.errors).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        fieldName = _ref2[0],
        msg = _ref2[1];

    var el = errorElements[fieldName];
    var errorClass = 'error';
    el.style.display = msg == '' ? 'none' : 'block';
    el.innerText = msg;
    el = inputElements[fieldName];

    if (msg == '') {
      el.classList.remove(errorClass);
    } else {
      el.classList.add(errorClass);
    }
  });
}

function resetForm() {
  sendButton.innerHTML = 'Contact Me';
  sendButton.classList.remove(validClass);
  formFields.forEach(function (el) {
    el.value = '';
    el.removeAttribute(validateAttr);
  });
  sending = false;
}

function showModal(msg) {
  body.style.overflow = 'hidden';
  contactModal.style.display = 'block';
  contactModalMsg.innerHTML = msg;
}

function closeModal() {
  body.style.overflow = 'visible';
  contactModal.style.display = 'none';
}

function sendMessage(data) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function () {
    resetForm();
    showModal('Your message has been sent.');
  });
  xhr.addEventListener('error', function () {
    resetForm();
    showModal('Your message could not be sent.<br>Please try again later.');
  });
  var postData = Object.fromEntries(Object.entries(data).map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        k = _ref4[0],
        v = _ref4[1];

    return [k, v.text];
  }));
  xhr.open('POST', postUrl);
  xhr.send(JSON.stringify(postData));
}

function validate() {
  var data = getFormData();
  var result = validateFormData(data);
  updateValidationErrors(result);

  if (result.valid && result.allFieldsValidated) {
    sendButton.classList.add(validClass);
  } else {
    sendButton.classList.remove(validClass);
  }

  return result;
}
/* Init */


if (sendButton) {
  var onScroll = function onScroll() {
    var y = window.scrollY;
    var i = sections.length;

    while (--i && y + 200 < sections[i].offsetTop) {}

    menus.forEach(function (el) {
      return el.classList.remove('sel');
    });
    menus[i].classList.add('sel');
  };

  inputElements['name'].setAttribute('placeholder', 'Your name');
  inputElements['email'].setAttribute('placeholder', 'Your email');
  inputElements['message'].setAttribute('placeholder', 'Your message');
  sendButton.addEventListener('click', function () {
    if (!sending) {
      sending = true;
      formFields.forEach(setValidateField);
      var result = validate();

      if (result.valid) {
        sendButton.innerHTML = 'Sending message <div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
        sendMessage(getFormData());
      }
    }
  });
  formFields.forEach(function (el) {
    el.addEventListener('input', debounce(function () {
      setValidateField(el);
      validate();
    }));
  });
  closeModalButton.addEventListener('click', function () {
    closeModal();
  });
  formFields.forEach(function (el) {
    if (el.value != '') setValidateField(el);
    validate();
  });
  /**************************************************************************/

  var sections = document.querySelectorAll('h2');
  var menus = [document.querySelector('#private-sessions-menu'), document.querySelector('#donation-menu'), document.querySelector('#contact-menu'), document.querySelector('#contact-menu')];
  window.addEventListener('scroll', onScroll);
  onScroll();
}
/**************************************************************************/


var rellaxMinWidth = 1020;
var showParallax = false;

function handleRellax() {
  if (document.documentElement.clientWidth >= rellaxMinWidth) {
    document.querySelector('.top-image img.parallax').style.display = 'block';
    document.querySelector('.top-image img.no-parallax').style.display = 'none';
  } else {
    document.querySelector('.top-image img.parallax').style.display = 'none';
    document.querySelector('.top-image img.no-parallax').style.display = 'block';
  }
}

window.addEventListener('resize', handleRellax);
rellax = new Rellax('.top-image img.parallax');
handleRellax();
