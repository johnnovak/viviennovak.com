const fieldNames = ['name', 'email', 'message', 'checkbox'];

const inputElements = {
  'name':     document.querySelector('#phone-input'),
  'email':    document.querySelector('#country-input'),
  'message':  document.querySelector('#comments-input'),
  'checkbox': document.querySelector('#checkbox-input')
}
const errorElements = {
  'name':     document.querySelector('#phone-error'),
  'email':    document.querySelector('#country-error'),
  'message':  document.querySelector('#comments-error'),
  'checkbox': document.querySelector('#checkbox-error')
}

const validateAttr = 'data-validate';
const validClass = 'valid';
const debounceDelayMs = 1000;

const body = document.querySelector('body');
const sendButton = document.querySelector('#submit');
const contactModal = document.getElementById('contact-modal');
const contactModalMsg = document.querySelector('#contact-modal > div > div');
const closeModalButton = document.getElementById('close-modal');
const postUrl = 'https://cxs5fa9xtc.execute-api.us-east-2.amazonaws.com/default/mailfwd';

const formFields = fieldNames.map(n => inputElements[n])

let sending = false;


function isValidateField(el) {
  return el.getAttribute(validateAttr) == '1'
}

function setValidateField(el) {
  el.setAttribute(validateAttr, '1')
}

function getInputValue(el) {
  if (el.type == 'checkbox') {
    return el.checked ? '1' : ''
  } else {
    return el.value
  }
}

function getFormData() {
  let data = {}
  fieldNames.forEach(name => {
    let el = inputElements[name]
    data[name] = {
      text: getInputValue(el),
      validate: isValidateField(el)
    }
  })
  return data
}

const debounce = (callback, delay = debounceDelayMs) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      timeoutId = null
      callback(...args)
    }, delay)
  }
}

function validateEmail(email) {
  var re = /\S+@\S+\.\S+/
  return re.test(email)
}

function validateFormData(data) {
  function setError(fieldName, msg) {
    result.valid = false
    result.errors[fieldName] = msg
  }

  let result = { errors: {} }
  fieldNames.forEach(name => setError(name, ''))
  result.valid = true

  let numFieldsValidated = 0

  if (data.name.validate) {
    numFieldsValidated++;
    if (data.name.text.trim() == '') {
      setError('name', 'Please enter your name')
    } else if (data.name.text.length < 2) {
      setError('name', 'Your name must be at least 2 characters long')
    }
  }

  if (data.email.validate) {
    numFieldsValidated++;
    if (data.email.text.trim() == '') {
      setError('email', 'Please enter your email address')
    } else if (!validateEmail(data.email.text)) {
      setError('email', 'Please enter a valid email address')
    }
  }

  if (data.message.validate) {
    numFieldsValidated++;
    if (data.message.text.trim() == '') {
      setError('message', 'Please enter your message')
    } else if (data.message.text.length < 50) {
      setError('message', 'Your message must be at least 50 characters long')
    }
  }

  if (data.checkbox.validate) {
    numFieldsValidated++;
    if (data.checkbox.text == '') {
      setError('checkbox', 'Please confirm that you have read and accept the disclaimer')
    }
  }

  result.allFieldsValidated = numFieldsValidated == 4

  return result
}

function updateValidationErrors(result) {
  Object.entries(result.errors).forEach( ([fieldName, msg]) => {
    let el = errorElements[fieldName]
    const errorClass = 'error'
    el.style.display = (msg == '' ? 'none' : 'block')
    el.innerText = msg

    el = inputElements[fieldName]
    if (msg == '') {
      el.classList.remove(errorClass)
    } else {
      el.classList.add(errorClass)
    }
  })
}

function resetForm() {
  sendButton.innerHTML = 'Contact Me'
  sendButton.classList.remove(validClass)

  formFields.forEach(el => {
    if (el.type == 'checkbox') {
      el.checked = false
    } else {
      el.value = ''
    }
    el.removeAttribute(validateAttr)
  })
  sending = false
}

function showModal(msg) {
  body.style.overflow = 'hidden';
  contactModal.style.display = 'flex';
  contactModalMsg.innerHTML = msg
}

function closeModal() {
  body.style.overflow = 'visible';
  contactModal.style.display = 'none';
}

function sendMessage(data) {
  const xhr = new XMLHttpRequest()

  xhr.addEventListener('load', () => {
    resetForm()
    showModal('<p class="success-icon">&#xea10;</p><p>Your message has been sent.</p>')
  })

  xhr.addEventListener('error', () => {
    resetForm()
    showModal('<p class="error-icon">&#xea0f;</p><p>Your message could not be sent.<br>Please try again later.</p>')
  })

  let postData = Object.fromEntries(
    Object.entries(data).map( ([k,v]) => [k, v.text] )
  )

  xhr.open('POST', postUrl)
  xhr.send(JSON.stringify(postData))
}

function validate() {
  let data = getFormData()
  let result = validateFormData(data)
  updateValidationErrors(result)

  if (result.valid && result.allFieldsValidated) {
    sendButton.classList.add(validClass)
  } else {
    sendButton.classList.remove(validClass)
  }
  return result
}


/* Init */

if (sendButton) {

  inputElements['name'].setAttribute('placeholder', 'Your name')
  inputElements['email'].setAttribute('placeholder', 'Your email')
  inputElements['message'].setAttribute('placeholder', 'Your message')

  sendButton.addEventListener('click', () => {
    if (!sending) {
      formFields.forEach(setValidateField)
      let result = validate()
      if (result.valid) {
        sending = true
        sendButton.innerHTML = 'Sending message <div class="lds-ring"><div></div><div></div><div></div><div></div></div>'
        sendMessage(getFormData())
      }
    }
  })

  formFields.forEach(el => {
    el.addEventListener('input', debounce(() => {
      setValidateField(el)
      validate()
    }))
  })

  closeModalButton.addEventListener('click', () => {
    closeModal()
  })

  formFields.forEach(el => {
    if (getInputValue(el) != '') setValidateField(el)
    validate()
  })

  /**************************************************************************/

  const sections = document.querySelectorAll('h2');

  const menus = [
    document.querySelector('#private-sessions-menu'),
    document.querySelector('#donation-menu'),
    document.querySelector('#contact-menu'),
    document.querySelector('#contact-menu')
  ]

  function onScroll() {
    let y = window.scrollY
    let i = sections.length

    while (--i && y + 200 < sections[i].offsetTop) {}

    menus.forEach(el => el.classList.remove('sel'))
    menus[i].classList.add('sel')
  }

  window.addEventListener('scroll', onScroll)

  onScroll()
}

/**************************************************************************/

const rellaxMinWidth = 1020
var showParallax = false

function handleRellax() {
  if (document.documentElement.clientWidth >= rellaxMinWidth) {
    document.querySelector('.top-image img.parallax').style.display = 'block'
    document.querySelector('.top-image img.no-parallax').style.display = 'none'
  } else {
    document.querySelector('.top-image img.parallax').style.display = 'none'
    document.querySelector('.top-image img.no-parallax').style.display = 'block'
  }
}

window.addEventListener('resize', handleRellax)

rellax = new Rellax('.top-image img.parallax')

handleRellax()

