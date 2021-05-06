class Stack {
    constructor() {
        this.data = []
        this.peek = 0
    }

    isEmpty() {
        return this.peek === 0
    }
    push(element) {
        this.data[this.peek] = element
        this.peek += 1
    }
    pop() {
        if (!this.isEmpty()) {
            this.peek -= 1
            return this.data.pop()
        }
    }
    top() {
        return this.data[this.peek - 1]
    }
}

const isOperand = (char) => { return !isNaN(char) }
const isOperator = (char) => {
    switch (char) {
        case '+':
        case '-':
        case '*':
        case '/':
        case '(':
            return true
    }
    return false
}
const inPrec = (char) => {
    switch(char) {
        case '+': 
        case '-': 
            return 2
        case '*': 
        case '/': 
            return 4
        case '(': 
            return 0
    }
}
const outPrec = (char) => {
    switch(char) {
        case '+': 
        case '-': 
            return 1
        case '*': 
        case '/': 
            return 3
        case '(': 
            return 100
    }
}

// Convert to Reverse Polish Notation
export const inToPost = (input) => {
    let stack = new Stack()
    let outputArr = []

    for (const i of input) {
        if (isOperand(i)) {
            outputArr.push(i)
        } else if (isOperator(i)) {
            if (stack.isEmpty() || outPrec(i) > inPrec(stack.top())) {
                stack.push(i)
            } else {
                while (!stack.isEmpty() && outPrec(i) < inPrec(stack.top())) {
                    outputArr.push(stack.top())
                    stack.pop()
                }
                stack.push(i)
            }
        } else if (i === ')') {
            while (stack.top() != '(') {
                outputArr.push(stack.top())
                stack.pop()
            }
            stack.pop()
        }
    }

    while (!stack.isEmpty()) {
        outputArr.push(stack.top())
        stack.pop()
    }

    return outputArr
}

// Calculate Reverse Polish Notation
export const evaluateOutputArr = (exp) => {
    let stack = new Stack()

    for (const i of exp) {
        if (isOperand(i)) {
            stack.push(+i)
        } else {
            const a = stack.pop()
            const b = stack.pop()
            switch(i) {
                case '+': stack.push(b + a) 
                break
                case '-': stack.push(b - a) 
                break
                case '*': stack.push(b * a) 
                break
                case '/': stack.push(b / a) 
            }
        }
    }

    return stack.pop()
}