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
    // 运算符栈
    let stack = new Stack()
    // 输出栈
    let outputArr = []

    for (const i of input) {
        // 如果为数字，直接输出
        if (isOperand(i)) {
            outputArr.push(i)
        // 如果为运算符
        } else if (isOperator(i)) {
            // 如果当前运算符优先级大于栈顶运算符优先级，当前运算符入运算符栈
            if (stack.isEmpty() || outPrec(i) > inPrec(stack.top())) {
                stack.push(i)
            } else {
                // 如果当前运算符优先级小于栈顶运算符优先级，循环输出栈顶运算符
                while (!stack.isEmpty() && outPrec(i) < inPrec(stack.top())) {
                    outputArr.push(stack.top())
                    stack.pop()
                }
                // 当前运算符入运算符栈
                stack.push(i)
            }
        // 如果为')'
        } else if (i === ')') {
            // 如果栈顶运算符不为'('，循环输出栈顶运算符输出直至'('
            while (stack.top() != '(') {
                outputArr.push(stack.top())
                stack.pop()
            }
            stack.pop()
        }
    }
    // 如果运算符栈不为空，循环依次输出栈顶运算符直至为空
    while (!stack.isEmpty()) {
        outputArr.push(stack.top())
        stack.pop()
    }
    // console.log(outputArr)
    return outputArr
}

// Calculate Reverse Polish Notation
export const evaluateOutputArr = (exp) => {
    // 数字栈
    let stack = new Stack()

    for (const i of exp) {
        // 如果为数字，入数字栈
        if (isOperand(i)) {
            stack.push(+i)
        } else {
            // 如果为运算符，由此运算符计算前两个数并输出结果至数字栈
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