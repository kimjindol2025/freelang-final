// ================================================================
// FreeLang Runtime v1 - Rust Implementation
// ================================================================
//
// 기본 런타임 구조 및 Value 타입 정의
// Phase B Week 2 구현
// 목표: 200줄
//
// ================================================================

use std::collections::HashMap;
use std::fmt;

// ================================================================
// 섹션 1: Value 타입 정의
// ================================================================

/// FreeLang의 모든 값을 표현하는 열거형
#[derive(Clone, Debug, PartialEq)]
pub enum Value {
    /// null 값
    Null,
    /// boolean 값
    Bool(bool),
    /// 정수
    Number(i32),
    /// 부동소수점 (추후 지원)
    Float(f64),
    /// 문자열
    String(String),
    /// 배열
    Array(Vec<Value>),
    /// 객체 (해시맵)
    Object(HashMap<String, Value>),
    /// 함수 (이름과 파라미터)
    Function {
        name: String,
        params: Vec<String>,
        // body는 AST 노드로 표현되어야 함 (추후 구현)
    },
}

impl Value {
    /// Value를 문자열로 변환
    pub fn to_string(&self) -> String {
        match self {
            Value::Null => "null".to_string(),
            Value::Bool(b) => b.to_string(),
            Value::Number(n) => n.to_string(),
            Value::Float(f) => f.to_string(),
            Value::String(s) => s.clone(),
            Value::Array(arr) => {
                let items: Vec<String> = arr.iter()
                    .map(|v| v.to_string())
                    .collect();
                format!("[{}]", items.join(", "))
            }
            Value::Object(map) => {
                let items: Vec<String> = map.iter()
                    .map(|(k, v)| format!("\"{}\": {}", k, v.to_string()))
                    .collect();
                format!("{{{}}}", items.join(", "))
            }
            Value::Function { name, params, .. } => {
                format!("fn {}({})", name, params.join(", "))
            }
        }
    }

    /// Value의 타입 이름 반환
    pub fn type_name(&self) -> &'static str {
        match self {
            Value::Null => "null",
            Value::Bool(_) => "bool",
            Value::Number(_) => "number",
            Value::Float(_) => "float",
            Value::String(_) => "string",
            Value::Array(_) => "array",
            Value::Object(_) => "object",
            Value::Function { .. } => "function",
        }
    }

    /// Value를 boolean으로 변환 (truthy/falsy)
    pub fn to_bool(&self) -> bool {
        match self {
            Value::Null => false,
            Value::Bool(b) => *b,
            Value::Number(n) => *n != 0,
            Value::Float(f) => *f != 0.0,
            Value::String(s) => !s.is_empty(),
            Value::Array(arr) => !arr.is_empty(),
            Value::Object(map) => !map.is_empty(),
            Value::Function { .. } => true,
        }
    }

    /// Value의 길이 반환 (배열, 문자열, 객체)
    pub fn len(&self) -> usize {
        match self {
            Value::String(s) => s.len(),
            Value::Array(arr) => arr.len(),
            Value::Object(map) => map.len(),
            _ => 0,
        }
    }
}

impl fmt::Display for Value {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_string())
    }
}

// ================================================================
// 섹션 2: 환경 (Scope) 관리
// ================================================================

/// 변수를 저장하는 환경
#[derive(Clone, Debug)]
pub struct Environment {
    /// 현재 스코프의 변수들
    variables: HashMap<String, Value>,
    /// 부모 스코프 (중첩된 환경)
    parent: Option<Box<Environment>>,
}

impl Environment {
    /// 새로운 환경 생성
    pub fn new() -> Self {
        Environment {
            variables: HashMap::new(),
            parent: None,
        }
    }

    /// 자식 환경 생성 (부모 체인 유지)
    pub fn new_child(parent: Environment) -> Self {
        Environment {
            variables: HashMap::new(),
            parent: Some(Box::new(parent)),
        }
    }

    /// 변수 정의
    pub fn define(&mut self, name: String, value: Value) {
        self.variables.insert(name, value);
    }

    /// 변수 조회 (부모 스코프까지 검색)
    pub fn get(&self, name: &str) -> Option<Value> {
        if let Some(value) = self.variables.get(name) {
            Some(value.clone())
        } else if let Some(parent) = &self.parent {
            parent.get(name)
        } else {
            None
        }
    }

    /// 변수 업데이트 (현재 스코프에서만)
    pub fn set(&mut self, name: &str, value: Value) -> bool {
        if self.variables.contains_key(name) {
            self.variables.insert(name.to_string(), value);
            true
        } else {
            false
        }
    }

    /// 변수 존재 여부
    pub fn exists(&self, name: &str) -> bool {
        if self.variables.contains_key(name) {
            true
        } else if let Some(parent) = &self.parent {
            parent.exists(name)
        } else {
            false
        }
    }
}

// ================================================================
// 섹션 3: 에러 처리
// ================================================================

/// 실행 중 발생할 수 있는 에러
#[derive(Clone, Debug, PartialEq)]
pub enum RuntimeError {
    /// 정의되지 않은 변수
    UndefinedVariable(String),
    /// 타입 불일치
    TypeMismatch(String),
    /// 0으로 나누기
    DivisionByZero,
    /// 배열 인덱스 범위 초과
    IndexOutOfBounds,
    /// 함수 호출 에러
    InvalidFunction(String),
    /// 일반 에러
    RuntimeError(String),
}

impl fmt::Display for RuntimeError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            RuntimeError::UndefinedVariable(name) => write!(f, "Undefined variable: {}", name),
            RuntimeError::TypeMismatch(msg) => write!(f, "Type mismatch: {}", msg),
            RuntimeError::DivisionByZero => write!(f, "Division by zero"),
            RuntimeError::IndexOutOfBounds => write!(f, "Index out of bounds"),
            RuntimeError::InvalidFunction(name) => write!(f, "Invalid function: {}", name),
            RuntimeError::RuntimeError(msg) => write!(f, "Runtime error: {}", msg),
        }
    }
}

pub type RuntimeResult<T> = Result<T, RuntimeError>;

// ================================================================
// 섹션 4: 기본 연산 구현
// ================================================================

/// 덧셈
pub fn add(left: &Value, right: &Value) -> RuntimeResult<Value> {
    match (left, right) {
        (Value::Number(a), Value::Number(b)) => Ok(Value::Number(a + b)),
        (Value::String(a), Value::String(b)) => {
            let mut result = a.clone();
            result.push_str(b);
            Ok(Value::String(result))
        }
        (Value::String(a), b) => {
            let mut result = a.clone();
            result.push_str(&b.to_string());
            Ok(Value::String(result))
        }
        _ => Err(RuntimeError::TypeMismatch(
            format!("Cannot add {} and {}", left.type_name(), right.type_name())
        )),
    }
}

/// 뺄셈
pub fn subtract(left: &Value, right: &Value) -> RuntimeResult<Value> {
    match (left, right) {
        (Value::Number(a), Value::Number(b)) => Ok(Value::Number(a - b)),
        _ => Err(RuntimeError::TypeMismatch(
            format!("Cannot subtract {} and {}", left.type_name(), right.type_name())
        )),
    }
}

/// 곱셈
pub fn multiply(left: &Value, right: &Value) -> RuntimeResult<Value> {
    match (left, right) {
        (Value::Number(a), Value::Number(b)) => Ok(Value::Number(a * b)),
        (Value::String(a), Value::Number(b)) => {
            if *b < 0 {
                return Err(RuntimeError::RuntimeError("Cannot repeat negative times".to_string()));
            }
            Ok(Value::String(a.repeat(*b as usize)))
        }
        _ => Err(RuntimeError::TypeMismatch(
            format!("Cannot multiply {} and {}", left.type_name(), right.type_name())
        )),
    }
}

/// 나눗셈
pub fn divide(left: &Value, right: &Value) -> RuntimeResult<Value> {
    match (left, right) {
        (Value::Number(a), Value::Number(b)) => {
            if *b == 0 {
                Err(RuntimeError::DivisionByZero)
            } else {
                Ok(Value::Number(a / b))
            }
        }
        _ => Err(RuntimeError::TypeMismatch(
            format!("Cannot divide {} and {}", left.type_name(), right.type_name())
        )),
    }
}

/// 비교: 같음
pub fn equals(left: &Value, right: &Value) -> RuntimeResult<Value> {
    Ok(Value::Bool(left == right))
}

/// 비교: 작음
pub fn less_than(left: &Value, right: &Value) -> RuntimeResult<Value> {
    match (left, right) {
        (Value::Number(a), Value::Number(b)) => Ok(Value::Bool(a < b)),
        (Value::String(a), Value::String(b)) => Ok(Value::Bool(a < b)),
        _ => Err(RuntimeError::TypeMismatch(
            format!("Cannot compare {} and {}", left.type_name(), right.type_name())
        )),
    }
}

/// 논리: AND
pub fn logical_and(left: &Value, right: &Value) -> RuntimeResult<Value> {
    Ok(Value::Bool(left.to_bool() && right.to_bool()))
}

/// 논리: OR
pub fn logical_or(left: &Value, right: &Value) -> RuntimeResult<Value> {
    Ok(Value::Bool(left.to_bool() || right.to_bool()))
}

// ================================================================
// 섹션 5: 평가자 구조
// ================================================================

/// AST를 평가하는 인터프리터
pub struct Evaluator {
    /// 현재 환경
    env: Environment,
}

impl Evaluator {
    /// 새로운 평가자 생성
    pub fn new() -> Self {
        Evaluator {
            env: Environment::new(),
        }
    }

    /// 변수 정의
    pub fn define_var(&mut self, name: String, value: Value) {
        self.env.define(name, value);
    }

    /// 변수 조회
    pub fn get_var(&self, name: &str) -> RuntimeResult<Value> {
        self.env.get(name)
            .ok_or_else(|| RuntimeError::UndefinedVariable(name.to_string()))
    }

    /// 현재 환경 획득
    pub fn env(&self) -> &Environment {
        &self.env
    }

    /// 현재 환경 가변 참조
    pub fn env_mut(&mut self) -> &mut Environment {
        &mut self.env
    }
}

impl Default for Evaluator {
    fn default() -> Self {
        Self::new()
    }
}

// ================================================================
// 섹션 6: 테스트
// ================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_value_types() {
        let null = Value::Null;
        let bool = Value::Bool(true);
        let num = Value::Number(42);
        let string = Value::String("hello".to_string());

        assert_eq!(null.type_name(), "null");
        assert_eq!(bool.type_name(), "bool");
        assert_eq!(num.type_name(), "number");
        assert_eq!(string.type_name(), "string");
    }

    #[test]
    fn test_truthy_falsy() {
        assert!(!Value::Null.to_bool());
        assert!(!Value::Bool(false).to_bool());
        assert!(!Value::Number(0).to_bool());
        assert!(!Value::String("".to_string()).to_bool());

        assert!(Value::Bool(true).to_bool());
        assert!(Value::Number(1).to_bool());
        assert!(Value::String("hello".to_string()).to_bool());
    }

    #[test]
    fn test_environment() {
        let mut env = Environment::new();

        env.define("x".to_string(), Value::Number(10));
        assert_eq!(env.get("x"), Some(Value::Number(10)));
        assert_eq!(env.exists("x"), true);
        assert_eq!(env.exists("y"), false);
    }

    #[test]
    fn test_arithmetic() {
        let a = Value::Number(5);
        let b = Value::Number(3);

        assert_eq!(add(&a, &b).unwrap(), Value::Number(8));
        assert_eq!(subtract(&a, &b).unwrap(), Value::Number(2));
        assert_eq!(multiply(&a, &b).unwrap(), Value::Number(15));
        assert_eq!(divide(&a, &b).unwrap(), Value::Number(1));
    }

    #[test]
    fn test_string_concat() {
        let a = Value::String("hello".to_string());
        let b = Value::String(" world".to_string());

        assert_eq!(
            add(&a, &b).unwrap(),
            Value::String("hello world".to_string())
        );
    }

    #[test]
    fn test_division_by_zero() {
        let a = Value::Number(5);
        let b = Value::Number(0);

        assert_eq!(divide(&a, &b), Err(RuntimeError::DivisionByZero));
    }
}
