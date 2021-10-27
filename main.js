const Modal = {
  open() {
    document.querySelector('div.modal-overlay').classList.add('active')
  },
  close() {
    document.querySelector('div.modal-overlay').classList.remove('active')
    const inputs = document.querySelectorAll('.input-group input')
    inputs.forEach(value =>
      documentObjectModel.deleteRequiredFieldMessage(value.id)
    )
    Form.clearFields()
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
  },
  set(transactions) {
    localStorage.setItem(
      'dev.finances:transactions',
      JSON.stringify(transactions)
    )
  }
}

const Transaction = {
  all: Storage.get(),
  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },
  remove(index) {
    Transaction.all.splice(index, 1)
    App.reload()
  },
  incomes() {
    let income = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount
      }
    })

    return income
  },
  expenses() {
    let expenses = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expenses += transaction.amount
      }
    })

    return expenses
  },
  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

const documentObjectModel = {
  transactionContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = documentObjectModel.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    documentObjectModel.transactionContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction, index) {
    const cssClass = transaction.amount >= 0 ? 'income' : 'expanse'

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
    <td class="description">${transaction.description}</td>
    <td class="${cssClass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td><img onclick="Transaction.remove(${index})"src="assets/minus.svg" alt="Remover transação" /></td>
    `

    return html
  },
  updateBlance() {
    document.querySelector('#incomeDisplay').innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    )
    document.querySelector('#expanseDisplay').innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    )
    document.querySelector('#totalDisplay').innerHTML = Utils.formatCurrency(
      Transaction.total()
    )
  },
  clearTransaction() {
    documentObjectModel.transactionContainer.innerHTML = ''
  },
  requiredFieldMessage(input) {
    input.classList.add('error')
    const div = input.parentNode
    const theElementExists = div.querySelector('.required-field-message')
    if (theElementExists === null) {
      const small = document.createElement('small')
      small.classList.add('required-field-message')
      small.innerHTML = 'Campo obrigatório'
      div.insertBefore(small, input.nextElementSibling)
    }
  },
  deleteRequiredFieldMessage(value) {
    document.querySelector(`#${value}`).classList.remove('error')
    const div = document.querySelector(`#${value}`).parentNode
    const small = div.querySelector(`.required-field-message`)
    if (small !== null) {
      if (small.parentNode) {
        small.parentNode.removeChild(small)
      }
    }
  }
}

const Utils = {
  formatAmount(amount) {
    amount = amount * 100
    return Math.round(amount)
  },
  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''
    value = String(value).replace(/\D/g, '')

    value = Number(value) / 100

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    return signal + value
  }
}

const Form = {
  description: document.querySelector('#description'),
  amount: document.querySelector('#amount'),
  date: document.querySelector('#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  validateField() {
    const { description, amount, date } = Form.getValues()

    if (description.trim() === '') {
      documentObjectModel.requiredFieldMessage(Form.description)
    } else {
      documentObjectModel.deleteRequiredFieldMessage(Form.description.id)
    }
    if (amount.trim() === '') {
      documentObjectModel.requiredFieldMessage(Form.amount)
    } else {
      documentObjectModel.deleteRequiredFieldMessage(Form.amount.id)
    }
    if (date.trim() === '') {
      documentObjectModel.requiredFieldMessage(Form.date)
    } else {
      documentObjectModel.deleteRequiredFieldMessage(Form.date.id)
    }

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error(`Invalid field`)
    }
  },
  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)
    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateField()
      const transaction = Form.formatValues()
      Transaction.add(transaction)
      Form.clearFields()
      Modal.close()
    } catch (error) {}
  }
}

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      documentObjectModel.addTransaction(transaction, index)
    })

    documentObjectModel.updateBlance()
    Storage.set(Transaction.all)
  },
  reload() {
    documentObjectModel.clearTransaction()
    App.init()
  }
}

App.init()
