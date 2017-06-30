#AQL
```sql
RETURN DOCUMENT("users/9883")
INSERT { name: "Katie Foster", age: 27 } INTO users
RETURN DOCUMENT( ["users/9883", "users/9915", "users/10074"] )
for循环
FOR user IN users
  RETURN user


```