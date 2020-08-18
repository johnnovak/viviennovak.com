const fieldNames = ['name', 'email', 'message'];
const validateAttr = 'data-validate';
const validClass = 'valid';
const debounceDelayMs = 1000;

const body = document.querySelector('body');
const sendButton = document.querySelector('button');
const contactModal = document.getElementById('contact-modal');
const contactModalMsg = document.querySelector('#contact-modal > div > p');
const closeModalButton = document.getElementById('close-modal');
const postUrl = 'https://cxs5fa9xtc.execute-api.us-east-2.amazonaws.com/default/mailfwd';

const formFields = fieldNames.map(inputElement)

let sending = false;


function inputElement(name) {
  return document.getElementById(`${name}-input`)
}

function errorElement(name) {
  return document.getElementById(`${name}-error`)
}

function isValidateField(el) {
  return el.getAttribute(validateAttr) == '1'
}

function setValidateField(el) {
  el.setAttribute(validateAttr, '1')
}

function getFormData() {
  let data = {}
  fieldNames.forEach(name => {
    let el = inputElement(name)
    data[name] = {
      text: el.value,
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

  result.allFieldsValidated = numFieldsValidated == 3

  return result
}

function updateValidationErrors(result) {
  Object.entries(result.errors).forEach( ([field, msg]) => {
    let el = errorElement(field)
    const errorClass = 'error'
    el.style.display = (msg == '' ? 'none' : 'block')
    el.innerText = msg

    el = inputElement(field)
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
    el.value = ''
    el.removeAttribute(validateAttr)
  })
  sending = false
}

function showModal(msg) {
  body.style.overflow = 'hidden';
  contactModal.style.display = 'block';
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
    showModal('Your message has been sent.')
  })

  xhr.addEventListener('error', () => {
    resetForm()
    showModal('Your message could not be sent.<br>Please try again later.')
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

sendButton.addEventListener('click', () => {
  if (!sending) {
    sending = true
    formFields.forEach(setValidateField)
    let result = validate()
    if (result.valid) {
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
  if (el.value != '') setValidateField(el)
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

