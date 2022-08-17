const mysql = require('mysql2')
const inquirer = require('inquirer')
const seed = require('./seed')

const connection = mysql.createConnection({
    host: "localhost",
    user: "root"
})

seed(connection)

async function tracker(){
    var done = false;
    let options = [
        "view all departments", 
        "view all roles",
        "view all employees", 
        "add a department", 
        "add a role", 
        "add an employee", 
        "update an employee role",
        "view employees by manager",
        "view employees by department",
        "update employee manager",
        "delete department",
        'delete role',
        "delete employee",
        "view budget for a department",
        "exit"
    ];
    while(!done){
        choice = await inquirer.prompt([
            {
                name: "choice",
                type: "list",
                message: "What would you like to do? ",
                choices: options,
            },
        ]);
        choice = choice.choice
        if (choice == options[0] ){
            await viewAllDepts();
        }else if (choice == options[1]){
            await viewAllRoles();
        }else if (choice == options[2]){
            await viewAllEmployees();
        }else if (choice == options[3]){
            await addDept()
        }else if (choice == options[4]){
            await addRole()
        }else if(choice == options[5]){
            await addEmp()
        }else if (choice == options[6]){
            await updateEmp()
        }else if (choice == options[7]){
            await viewEmpByMgr()
        }else if (choice == options[8]){
            await viewEmpByDept()
        }else if (choice == options[9]){
            await updateEmpMgr()
        }else if (choice == options[10]){
            await delDept()
        }else if (choice == options[11]){
            await delRole()
        }else if (choice == options[12]){
            await delEmp()
        }else if (choice == options[13]){
            await deptExp()
        }else{
            done = true
        }
    }
}

async function viewAllDepts(){
    await new Promise((resolve, reject) =>{
        connection.query("select * from department", (err, result)=>{
            if (err) return reject(err)
            console.table(result)
            return resolve(result)
        })
    })
}
async function viewAllRoles(){
    await new Promise((resolve, reject) =>{
        connection.query("select * from role", (err, result)=>{
            if (err) return reject(err)
            console.table(result)
            return resolve(result)
        })
    })
}
async function getManager(id){
    let res =  await new Promise((resolve, reject)=>{
        connection.query("SELECT CONCAT(e2.first_name, SPACE(1), e2.last_name) as manager from employee e LEFT JOIN employee e2 on e.manager_id = e2.id where e.id = "+id+" UNION SELECT CONCAT(e2.first_name, SPACE(1), e2.last_name) as manager from employee e RIGHT JOIN employee e2 on e.manager_id = e2.id where e.id = "+id, (err, result)=>{
            if (err) return reject(err)
            return resolve(result)
        })
    })

    return res
}

async function viewAllEmployees(){
    let result = await new Promise((resolve, reject) =>{
        connection.query("select e.id, first_name, last_name, title, name as department, salary from employee as e JOIN role on role.id = e.role_id JOIN department on department.id = role.department_id", (err, result)=>{
            if (err) return reject(err)
            return resolve(result)
        })
    })


    for(var i = 0; i < result.length; i++){
        val = result[i];
        mgr = await getManager(val.id)
        val.manager = mgr[0].manager;
    }

    console.table(result)
}
async function addDept(){
    let result = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is the name of the department? "
        }
    ])
    let name = result.name;
    await new Promise((resolve, reject) =>{
        connection.query("insert into department (name) value('"+name+"')", (err, result)=>{
            if (err) return reject(err)
            console.log("Added "+name+" to the database")
            return resolve(result)
        })
    })
}
async function getDepartments(){
    let result = await new Promise((resolve, reject) =>{
        connection.query("select * from department", (err, result)=>{
            if (err) return reject(err)
            return resolve(result)
        })
    }); 
    return result;
}
async function getRoles(){
    let result = await new Promise((resolve, reject) =>{
        connection.query("select * from role", (err, result)=>{
            if (err) return reject(err)
            return resolve(result)
        })
    }); 
    return result;
}
async function addRole(){

    let departments = await getDepartments();

    let result = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is the name of the role? "
        },
        {
            type: "number",
            name: "salary",
            message: "What is the salary of the role? "
        },
        {
            type: "list",
            name: "department_id",
            message: "What is the department of the role",
            choices: departments
        }
    ])
    let name = result.name;
    let salary = result.salary;
    let department_id = 0;

    for(var i = 0; i < departments.length; i++){
        if (departments[i].name == result.department_id){
            department_id = departments[i].id
        }
        
    }

    await new Promise((resolve, reject) =>{
        connection.query("insert into role (title, salary, department_id) values('"+name+"',"+salary+","+department_id+")", (err, result)=>{
            if (err) return reject(err)
            console.log("Added "+name+" to the database")
            return resolve(result)
        })
    })
}
async function getRoles(){
    let result = await new Promise((resolve, reject) =>{
        connection.query("select id, title from role", (err, result)=>{
            if (err) return reject(err)
            return resolve(result)
        })
    }); 
    return result;
}
async function getEmployees(){
    let result = await new Promise((resolve, reject) =>{
        connection.query("select * from employee", (err, result)=>{
            if (err) return reject(err)
            return resolve(result)
        })
    }); 
    return result;
}
async function addEmp(){
    let roles = await getRoles();
    let employees = await getEmployees();
    let managers = []
    managers.push("None")
    for(var i = 0; i < employees.length; i++){
        managers.push(employees[i].first_name+" "+employees[i].last_name)
    }
    rolesC = []
    for(var i = 0; i < roles.length; i++){
        rolesC.push(roles[i].title)
    }

    let result = await inquirer.prompt([
        {
            type: "input",
            name: "fname",
            message: "What is the first name of the employee? "
        },
        {
            type: "input",
            name: "lname",
            message: "What is the last name of the employee? "
        },
        {
            type: "list",
            name: "role",
            message: "What is the role of the employee? ",
            choices: rolesC
        },
        {
            type: "list",
            name: "manager",
            message: "Who is the manager of the employee? ",
            choices: managers
        }
    ])
    let fname = result.fname;
    let lname = result.lname;
    let role_id = 0;
    let manager_id = "null";

    for(var i = 0; i < employees.length; i++){
        if ((employees[i].first_name+" "+employees[i].last_name) == result.manager){
            manager_id = employees[i].id
        }
        
    }

    for(var i = 0; i < roles.length; i++){
        if ((roles[i].title) == result.role){
            role_id = roles[i].id
        }
        
    }
    let name = fname+" "+lname;
    await new Promise((resolve, reject) =>{
        connection.query("insert into employee (first_name, last_name, role_id, manager_id) values('"+fname+"','"+lname+"',"+role_id+","+manager_id+")", (err, result)=>{
            if (err) return reject(err)
            console.log("Added "+name+" to the database")
            return resolve(result)
        })
    })
}
async function updateEmp(){
    let employees = await getEmployees();
    let emps = []
    let roles = await getRoles();
    for(var i = 0; i < employees.length; i++){
        emps.push(employees[i].first_name+" "+employees[i].last_name)
    }
    rolesC = []
    for(var i = 0; i < roles.length; i++){
        rolesC.push(roles[i].title)
    }

    let result = await inquirer.prompt([
        {
            type: "list",
            name: "emp",
            message: "Which employee's role do you want to update? ",
            choices: emps
        },
        {
            type: "list",
            name: "role",
            message: "What is the new role of the employee? ",
            choices: rolesC
        }
    ]);

    let role_id = 0;
    let emp_id = "null";

    for(var i = 0; i < employees.length; i++){
        if ((employees[i].first_name+" "+employees[i].last_name) == result.emp){
            emp_id = employees[i].id
        }
        
    }

    for(var i = 0; i < roles.length; i++){
        if ((roles[i].title) == result.role){
            role_id = roles[i].id
        } 
    }

    await new Promise((resolve, reject) =>{
        connection.query("update employee set role_id = "+role_id+" where id = "+emp_id, (err, result)=>{
            if (err) return reject(err)
            console.log("Updated the employee")
            return resolve(result)
        })
    })
}

async function updateEmpMgr(){
    let employees = await getEmployees();
    let emps = []
    let mgrs = ["None"]
    for(var i = 0; i < employees.length; i++){
        emps.push(employees[i].first_name+" "+employees[i].last_name)
        mgrs.push(employees[i].first_name+" "+employees[i].last_name)
    }
    

    let result = await inquirer.prompt([
        {
            type: "list",
            name: "emp",
            message: "Which employee's manager do you want to update? ",
            choices: emps
        },
        {
            type: "list",
            name: "mgr",
            message: "Who is the new manager of the employee? ",
            choices: mgrs
        }
    ]);

    let mgr_id = "null";
    let emp_id = "null";

    for(var i = 0; i < employees.length; i++){
        if ((employees[i].first_name+" "+employees[i].last_name) == result.emp){
            emp_id = employees[i].id
        }
    }

    for(var i = 0; i < employees.length; i++){
        if ((employees[i].first_name+" "+employees[i].last_name) == result.mgr){
            mgr_id = employees[i].id
        } 
    }

    await new Promise((resolve, reject) =>{
        connection.query("update employee set manager_id = "+mgr_id+" where id = "+emp_id, (err, result)=>{
            if (err) return reject(err)
            console.log("Updated the employee")
            return resolve(result)
        })
    })
}

async function viewEmpByMgr(){
    let employees = await getEmployees();
    let mgrs = ["None"]
    for(var i = 0; i < employees.length; i++){
        mgrs.push(employees[i].first_name+" "+employees[i].last_name)
    }
    

    let result = await inquirer.prompt([
        {
            type: "list",
            name: "mgr",
            message: "Select the manager: ",
            choices: mgrs
        }
    ]);

    let mgr_id = "null";


    for(var i = 0; i < employees.length; i++){
        if ((employees[i].first_name+" "+employees[i].last_name) == result.mgr){
            mgr_id = employees[i].id
        } 
    }

    result = await new Promise((resolve, reject) =>{
        connection.query("select e.id, first_name, last_name, title, name as department, salary as manager from employee as e JOIN role on role.id = e.role_id JOIN department on department.id = role.department_id where manager_id = "+mgr_id, (err, result)=>{
            if (err) return reject(err)
            return resolve(result)
        })
    })


    for(var i = 0; i < result.length; i++){
        val = result[i];
        mgr = await getManager(val.id)
        val.manager = mgr[0].manager;
    }

    console.table(result)
}

async function viewEmpByDept(){
    let departments = await getDepartments();

    let result = await inquirer.prompt([
        {
            type: "list",
            name: "department_id",
            message: "Select the department",
            choices: departments
        }
    ])
    
    let department_id = 0;

    for(var i = 0; i < departments.length; i++){
        if (departments[i].name == result.department_id){
            department_id = departments[i].id
        }
    }

    result = await new Promise((resolve, reject) =>{
        connection.query("select e.id, first_name, last_name, title, name as department, salary as manager from employee as e JOIN role on role.id = e.role_id JOIN department on department.id = role.department_id where department_id = "+department_id, (err, result)=>{
            if (err) return reject(err)
            return resolve(result)
        })
    })


    for(var i = 0; i < result.length; i++){
        val = result[i];
        mgr = await getManager(val.id)
        val.manager = mgr[0].manager;
    }

    console.table(result)
}

async function delDept(){
    let departments = await getDepartments();

    let result = await inquirer.prompt([
        {
            type: "list",
            name: "department_id",
            message: "Select the department",
            choices: departments
        }
    ])
    
    let department_id = 0;

    for(var i = 0; i < departments.length; i++){
        if (departments[i].name == result.department_id){
            department_id = departments[i].id
        }
    }

    await new Promise((resolve, reject) =>{
        connection.query("delete from department where id = "+department_id, (err, result)=>{
            if (err) {
                console.log("Unable to delete department. Make sure there are no child records associated with the record first")
                return resolve(err)
            }
            console.log("Department deleted")
            return resolve(result)
        })
    })
}

async function delRole(){
    let roles = await getRoles();
    rolesC = []
    for(var i = 0; i < roles.length; i++){
        rolesC.push(roles[i].title)
    }

    let result = await inquirer.prompt([
        {
            type: "list",
            name: "role",
            message: "Select the role to delete",
            choices: rolesC
        }
    ])
    
    let role_id = 0;

    for(var i = 0; i < roles.length; i++){
        if ((roles[i].title) == result.role){
            role_id = roles[i].id
        }
    }
    console.log(role_id)
    await new Promise((resolve, reject) =>{
        connection.query("delete from role where id = "+role_id, (err, result)=>{
            if (err) {
                console.log("Unable to delete role. Make sure there are no child records associated with the record first")
                return resolve(err)
            }
            console.log("Role deleted")
            return resolve(result)
        })
    })
}

async function delEmp(){
    let employees = await getEmployees();
    let mgrs = []
    for(var i = 0; i < employees.length; i++){
        mgrs.push(employees[i].first_name+" "+employees[i].last_name)
    }
    

    let result = await inquirer.prompt([
        {
            type: "list",
            name: "mgr",
            message: "Select the employee to delete: ",
            choices: mgrs
        }
    ]);

    let mgr_id = "null";


    for(var i = 0; i < employees.length; i++){
        if ((employees[i].first_name+" "+employees[i].last_name) == result.mgr){
            mgr_id = employees[i].id
        } 
    }

    await new Promise((resolve, reject) =>{
        connection.query("delete from employee where id = "+mgr_id, (err, result)=>{
            if (err) {
                console.log("Unable to delete the employee. Make sure the employee is not managing another employee")
                return resolve(err)
            }
            console.log("Employee deleted")
            return resolve(result)
        })
    })
}

async function deptExp(){

    let departments = await getDepartments();

    let result = await inquirer.prompt([
        {
            type: "list",
            name: "department_id",
            message: "Select the department",
            choices: departments
        }
    ])
    
    let department_id = 0;

    for(var i = 0; i < departments.length; i++){
        if (departments[i].name == result.department_id){
            department_id = departments[i].id
        }
    }

    await new Promise((resolve, reject) =>{
        connection.query("SELECT SUM(r.salary) as total from employee e INNER JOIN role r on r.id = e.role_id INNER JOIN department d on d.id = r.department_id where d.id = "+department_id+" GROUP BY d.id", (err, result)=>{
            if (err) {
                return reject(err)
            }
            console.table(result)
            return resolve(result)
        })
    })

    

}

tracker()


