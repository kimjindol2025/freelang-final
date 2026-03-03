// ================================================================
// FreeLang Runtime Evaluator - Rust Implementation
// ================================================================
//
// AST 평가자 및 기본 실행 엔진
// Phase B Week 3 구현
// 목표: 500줄
//
// ================================================================

use std::collections::HashMap;

// ================================================================
// 섹션 1: AST 노드 정의
// ================================================================

/// 추상 문법 트리 (AST) 노드
#[derive(Clone, Debug, PartialEq)]
pub enum ASTNode {
    /// 숫자 리터럴
    Number(i32),
    /// 문자열 리터럴
    String(String),
    /// 불린 리터럴
    Bool(bool),
    /// null 리터럴
    Null,
    /// 변수 식별자
    Identifier(String),
    /// 이항 표현식 (예: a + b)
    BinaryOp {
        left: Box<ASTNode>,
        op: String,
        right: Box<ASTNode>,
    },
    /// 단항 표현식 (예: -a, !b)
    UnaryOp {
        op: String,
        operand: Box<ASTNode>,
    },
    /// 함수 호출
    Call {
        callee: Box<ASTNode>,
        args: Vec<ASTNode>,
    },
    /// 변수 할당
    Assignment {
        name: String,
        value: Box<ASTNode>,
    },
    /// if 표현식
    If {
        condition: Box<ASTNode>,
        then_body: Box<ASTNode>,
        else_body: Option<Box<ASTNode>>,
    },
    /// while 루프
    While {
        condition: Box<ASTNode>,
        body: Box<ASTNode>,
    },
    /// for 루프
    For {
        var: String,
        from: Box<ASTNode>,
        to: Box<ASTNode>,
        body: Box<ASTNode>,
    },
    /// 블록 (여러 문)
    Block(Vec<ASTNode>),
    /// 함수 정의
    FunctionDef {
        name: String,
        params: Vec<String>,
        body: Box<ASTNode>,
    },
    /// return 문
    Return(Box<ASTNode>),
    /// 배열 리터럴
    Array(Vec<ASTNode>),
    /// 배열 인덱싱
    Index {
        array: Box<ASTNode>,
        index: Box<ASTNode>,
    },
}

// ================================================================
// 섹션 2: 평가자 구현
// ================================================================

use super::{Value, Environment, RuntimeError, RuntimeResult};

/// AST 노드를 평가하는 평가자
pub struct Evaluator {
    env: Environment,
    /// 함수 정의 저장소
    functions: HashMap<String, (Vec<String>, ASTNode)>,
}

impl Evaluator {
    /// 새로운 평가자 생성
    pub fn new() -> Self {
        Evaluator {
            env: Environment::new(),
            functions: HashMap::new(),
        }
    }

    /// AST 노드 평가
    pub fn eval(&mut self, node: &ASTNode) -> RuntimeResult<Value> {
        match node {
            ASTNode::Number(n) => Ok(Value::Number(*n)),
            ASTNode::String(s) => Ok(Value::String(s.clone())),
            ASTNode::Bool(b) => Ok(Value::Bool(*b)),
            ASTNode::Null => Ok(Value::Null),

            ASTNode::Identifier(name) => {
                self.env.get(name)
                    .ok_or_else(|| RuntimeError::UndefinedVariable(name.clone()))
            }

            ASTNode::BinaryOp { left, op, right } => {
                let left_val = self.eval(left)?;
                let right_val = self.eval(right)?;
                self.eval_binary_op(&left_val, &op, &right_val)
            }

            ASTNode::UnaryOp { op, operand } => {
                let operand_val = self.eval(operand)?;
                self.eval_unary_op(&op, &operand_val)
            }

            ASTNode::Call { callee, args } => {
                match callee.as_ref() {
                    ASTNode::Identifier(name) => {
                        let arg_vals: RuntimeResult<Vec<Value>> = args
                            .iter()
                            .map(|arg| self.eval(arg))
                            .collect();
                        let arg_vals = arg_vals?;
                        self.call_function(name, arg_vals)
                    }
                    _ => Err(RuntimeError::InvalidFunction("Invalid callee".to_string()))
                }
            }

            ASTNode::Assignment { name, value } => {
                let val = self.eval(value)?;
                self.env.define(name.clone(), val.clone());
                Ok(val)
            }

            ASTNode::If { condition, then_body, else_body } => {
                let cond_val = self.eval(condition)?;
                if cond_val.to_bool() {
                    self.eval(then_body)
                } else if let Some(else_b) = else_body {
                    self.eval(else_b)
                } else {
                    Ok(Value::Null)
                }
            }

            ASTNode::While { condition, body } => {
                let mut last_val = Value::Null;
                loop {
                    let cond_val = self.eval(condition)?;
                    if !cond_val.to_bool() {
                        break;
                    }
                    last_val = self.eval(body)?;
                }
                Ok(last_val)
            }

            ASTNode::For { var, from, to, body } => {
                let from_val = self.eval(from)?;
                let to_val = self.eval(to)?;

                if let (Value::Number(f), Value::Number(t)) = (from_val, to_val) {
                    let mut last_val = Value::Null;
                    for i in f..t {
                        self.env.define(var.clone(), Value::Number(i));
                        last_val = self.eval(body)?;
                    }
                    Ok(last_val)
                } else {
                    Err(RuntimeError::TypeMismatch(
                        "for loop requires number range".to_string()
                    ))
                }
            }

            ASTNode::Block(statements) => {
                let mut last_val = Value::Null;
                for stmt in statements {
                    last_val = self.eval(stmt)?;
                }
                Ok(last_val)
            }

            ASTNode::FunctionDef { name, params, body } => {
                self.functions.insert(
                    name.clone(),
                    (params.clone(), body.as_ref().clone())
                );
                Ok(Value::Function {
                    name: name.clone(),
                    params: params.clone(),
                })
            }

            ASTNode::Return(value) => {
                // Return은 평가자에서 특별하게 처리
                self.eval(value)
            }

            ASTNode::Array(elements) => {
                let values: RuntimeResult<Vec<Value>> = elements
                    .iter()
                    .map(|elem| self.eval(elem))
                    .collect();
                Ok(Value::Array(values?))
            }

            ASTNode::Index { array, index } => {
                let array_val = self.eval(array)?;
                let index_val = self.eval(index)?;

                if let (Value::Array(arr), Value::Number(idx)) = (array_val, index_val) {
                    if idx < 0 || idx >= arr.len() as i32 {
                        Err(RuntimeError::IndexOutOfBounds)
                    } else {
                        Ok(arr[idx as usize].clone())
                    }
                } else {
                    Err(RuntimeError::TypeMismatch(
                        "Cannot index non-array".to_string()
                    ))
                }
            }
        }
    }

    /// 이항 연산 평가
    fn eval_binary_op(&self, left: &Value, op: &str, right: &Value) -> RuntimeResult<Value> {
        match op {
            "+" => self.add(left, right),
            "-" => self.subtract(left, right),
            "*" => self.multiply(left, right),
            "/" => self.divide(left, right),
            "%" => self.modulo(left, right),
            "==" => Ok(Value::Bool(left == right)),
            "!=" => Ok(Value::Bool(left != right)),
            "<" => self.less_than(left, right),
            ">" => self.greater_than(left, right),
            "<=" => self.less_equal(left, right),
            ">=" => self.greater_equal(left, right),
            "and" => Ok(Value::Bool(left.to_bool() && right.to_bool())),
            "or" => Ok(Value::Bool(left.to_bool() || right.to_bool())),
            _ => Err(RuntimeError::RuntimeError(format!("Unknown operator: {}", op)))
        }
    }

    /// 단항 연산 평가
    fn eval_unary_op(&self, op: &str, operand: &Value) -> RuntimeResult<Value> {
        match op {
            "-" => {
                if let Value::Number(n) = operand {
                    Ok(Value::Number(-n))
                } else {
                    Err(RuntimeError::TypeMismatch("Cannot negate non-number".to_string()))
                }
            }
            "!" => Ok(Value::Bool(!operand.to_bool())),
            _ => Err(RuntimeError::RuntimeError(format!("Unknown unary operator: {}", op)))
        }
    }

    /// 함수 호출
    fn call_function(&mut self, name: &str, args: Vec<Value>) -> RuntimeResult<Value> {
        // 함수가 정의되어 있는지 확인
        if let Some((params, body)) = self.functions.get(name).cloned() {
            if params.len() != args.len() {
                return Err(RuntimeError::InvalidFunction(
                    format!("Function {} expects {} args, got {}", name, params.len(), args.len())
                ));
            }

            // 새로운 환경에서 함수 실행
            let saved_env = self.env.clone();

            // 파라미터 바인딩
            for (param, arg) in params.iter().zip(args.iter()) {
                self.env.define(param.clone(), arg.clone());
            }

            // 함수 본문 평가
            let result = self.eval(&body);

            // 환경 복원
            self.env = saved_env;

            result
        } else {
            Err(RuntimeError::InvalidFunction(format!("Undefined function: {}", name)))
        }
    }

    // 산술 연산
    fn add(&self, left: &Value, right: &Value) -> RuntimeResult<Value> {
        match (left, right) {
            (Value::Number(a), Value::Number(b)) => Ok(Value::Number(a + b)),
            (Value::String(a), Value::String(b)) => {
                let mut result = a.clone();
                result.push_str(b);
                Ok(Value::String(result))
            }
            _ => Err(RuntimeError::TypeMismatch("Cannot add these types".to_string()))
        }
    }

    fn subtract(&self, left: &Value, right: &Value) -> RuntimeResult<Value> {
        match (left, right) {
            (Value::Number(a), Value::Number(b)) => Ok(Value::Number(a - b)),
            _ => Err(RuntimeError::TypeMismatch("Cannot subtract non-numbers".to_string()))
        }
    }

    fn multiply(&self, left: &Value, right: &Value) -> RuntimeResult<Value> {
        match (left, right) {
            (Value::Number(a), Value::Number(b)) => Ok(Value::Number(a * b)),
            _ => Err(RuntimeError::TypeMismatch("Cannot multiply non-numbers".to_string()))
        }
    }

    fn divide(&self, left: &Value, right: &Value) -> RuntimeResult<Value> {
        match (left, right) {
            (Value::Number(a), Value::Number(b)) => {
                if *b == 0 {
                    Err(RuntimeError::DivisionByZero)
                } else {
                    Ok(Value::Number(a / b))
                }
            }
            _ => Err(RuntimeError::TypeMismatch("Cannot divide non-numbers".to_string()))
        }
    }

    fn modulo(&self, left: &Value, right: &Value) -> RuntimeResult<Value> {
        match (left, right) {
            (Value::Number(a), Value::Number(b)) => {
                if *b == 0 {
                    Err(RuntimeError::DivisionByZero)
                } else {
                    Ok(Value::Number(a % b))
                }
            }
            _ => Err(RuntimeError::TypeMismatch("Cannot modulo non-numbers".to_string()))
        }
    }

    // 비교 연산
    fn less_than(&self, left: &Value, right: &Value) -> RuntimeResult<Value> {
        match (left, right) {
            (Value::Number(a), Value::Number(b)) => Ok(Value::Bool(a < b)),
            _ => Err(RuntimeError::TypeMismatch("Cannot compare non-numbers".to_string()))
        }
    }

    fn greater_than(&self, left: &Value, right: &Value) -> RuntimeResult<Value> {
        match (left, right) {
            (Value::Number(a), Value::Number(b)) => Ok(Value::Bool(a > b)),
            _ => Err(RuntimeError::TypeMismatch("Cannot compare non-numbers".to_string()))
        }
    }

    fn less_equal(&self, left: &Value, right: &Value) -> RuntimeResult<Value> {
        match (left, right) {
            (Value::Number(a), Value::Number(b)) => Ok(Value::Bool(a <= b)),
            _ => Err(RuntimeError::TypeMismatch("Cannot compare non-numbers".to_string()))
        }
    }

    fn greater_equal(&self, left: &Value, right: &Value) -> RuntimeResult<Value> {
        match (left, right) {
            (Value::Number(a), Value::Number(b)) => Ok(Value::Bool(a >= b)),
            _ => Err(RuntimeError::TypeMismatch("Cannot compare non-numbers".to_string()))
        }
    }
}

impl Default for Evaluator {
    fn default() -> Self {
        Self::new()
    }
}

// ================================================================
// 섹션 3: 테스트
// ================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_arithmetic() {
        let mut eval = Evaluator::new();

        let expr = ASTNode::BinaryOp {
            left: Box::new(ASTNode::Number(5)),
            op: "+".to_string(),
            right: Box::new(ASTNode::Number(3)),
        };

        let result = eval.eval(&expr).unwrap();
        assert_eq!(result, Value::Number(8));
    }

    #[test]
    fn test_variable_assignment() {
        let mut eval = Evaluator::new();

        // let x = 10
        let assign = ASTNode::Assignment {
            name: "x".to_string(),
            value: Box::new(ASTNode::Number(10)),
        };
        eval.eval(&assign).unwrap();

        // x
        let ident = ASTNode::Identifier("x".to_string());
        let result = eval.eval(&ident).unwrap();
        assert_eq!(result, Value::Number(10));
    }

    #[test]
    fn test_if_expression() {
        let mut eval = Evaluator::new();

        let expr = ASTNode::If {
            condition: Box::new(ASTNode::Number(5)),  // truthy
            then_body: Box::new(ASTNode::Number(10)),
            else_body: Some(Box::new(ASTNode::Number(20))),
        };

        let result = eval.eval(&expr).unwrap();
        assert_eq!(result, Value::Number(10));
    }

    #[test]
    fn test_array_literal() {
        let mut eval = Evaluator::new();

        let expr = ASTNode::Array(vec![
            ASTNode::Number(1),
            ASTNode::Number(2),
            ASTNode::Number(3),
        ]);

        let result = eval.eval(&expr).unwrap();
        match result {
            Value::Array(arr) => {
                assert_eq!(arr.len(), 3);
                assert_eq!(arr[0], Value::Number(1));
            }
            _ => panic!("Expected array"),
        }
    }

    #[test]
    fn test_string_concatenation() {
        let mut eval = Evaluator::new();

        let expr = ASTNode::BinaryOp {
            left: Box::new(ASTNode::String("Hello ".to_string())),
            op: "+".to_string(),
            right: Box::new(ASTNode::String("World".to_string())),
        };

        let result = eval.eval(&expr).unwrap();
        assert_eq!(result, Value::String("Hello World".to_string()));
    }

    #[test]
    fn test_logical_and() {
        let mut eval = Evaluator::new();

        let expr = ASTNode::BinaryOp {
            left: Box::new(ASTNode::Bool(true)),
            op: "and".to_string(),
            right: Box::new(ASTNode::Bool(false)),
        };

        let result = eval.eval(&expr).unwrap();
        assert_eq!(result, Value::Bool(false));
    }
}
