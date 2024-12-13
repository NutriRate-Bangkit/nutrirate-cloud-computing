# 🥗 Nutrition API Documentation

### 🔐 Register

_Endpoint:_

POST /auth/register

_Request Body:_

| Field    | Type   | Description             | Validation                           |
| :------- | :----- | :---------------------- | :----------------------------------- |
| name     | string | User's full name        | Required, min 2 characters           |
| email    | string | User's email address    | Required, unique, valid email format |
| password | string | User's account password | Required, min 8 characters, complex  |

_Response:_
json
{
"error": false,
"message": "User Created"
}

### 🔑 Login

_Endpoint:_

POST /auth/login

_Request Body:_

| Field    | Type   | Description             | Validation            |
| :------- | :----- | :---------------------- | :-------------------- |
| email    | string | User's registered email | Required, valid email |
| password | string | User's account password | Required              |

_Response:_
json
{
"error": false,
"message": "Login successful",
"userId": "abc123",
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

### 🚪 Logout

_Endpoint:_

POST /auth/logout

_Headers:_

| Header        | Description             | Required |
| :------------ | :---------------------- | :------- |
| Authorization | Bearer token from login | ✅       |

_Response:_
json
{
"error": false,
"message": "Logout successful"
}

### 🔐 Reset Password

_Endpoint:_

POST /auth/reset-password

_Request Body:_

| Field | Type   | Description             | Validation            |
| :---- | :----- | :---------------------- | :-------------------- |
| email | string | User's registered email | Required, valid email |

_Response:_
json
{
"error": false,
"message": "Password reset email sent"
}

### 📜 Get History

_Endpoint:_

GET /history

_Headers:_

| Header        | Description             | Required |
| :------------ | :---------------------- | :------- |
| Authorization | Bearer token from login | ✅       |

_Response:_
json
{
"history": [
{
"id": "abc123",
"userId": "user123",
"inputs": {
"protein": 10,
"energy": 200,
"fat": 5,
"saturated_fat": 2,
"sugars": 15,
"fiber": 3,
"salt": 0.5
},
"grade": "A",
"timestamp": "2023-05-01T12:34:56Z"
}
]
}

### 🧬 Predict Nutrition Grade

_Endpoint:_

POST /predict

_Headers:_

| Header        | Description             | Required |
| :------------ | :---------------------- | :------- |
| Authorization | Bearer token from login | ✅       |

_Request Body:_

| Field         | Type   | Description    | Range       |
| :------------ | :----- | :------------- | :---------- |
| protein       | number | Protein amount | 0-100g      |
| energy        | number | Energy amount  | 0-2000 kcal |
| fat           | number | Total fat      | 0-100g      |
| saturated_fat | number | Saturated fat  | 0-50g       |
| sugars        | number | Sugar amount   | 0-50g       |
| fiber         | number | Dietary fiber  | 0-30g       |
| salt          | number | Salt amount    | 0-10g       |

_Response:_
json
{
"grade": "A"
}

