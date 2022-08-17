
function seed(connection){
    queries = [
        "drop database if exists tracker",
        "create database tracker",
        "use tracker",
        "create table department( id int not null auto_increment primary key, name varchar(30))",
        "create table role( id int not null auto_increment primary key, title varchar(30), salary decimal, department_id int)",
        "create table employee( id int not null auto_increment primary key, first_name varchar(30), last_name varchar(30), role_id int, manager_id int)",
        "alter table role add constraint foreign key (department_id) references department (id)",
        "alter table employee add constraint foreign key (role_id) references role (id)",
        "alter table employee add constraint foreign key (manager_id) references employee (id)",
        "insert into department(name) values ('Sales')",
        "insert into department(name) values ('Engineering')",
        "insert into department(name) values ('Finance')",
        "insert into role(title, salary, department_id) values ('Sales Lead', 100000, 1)",
        "insert into role(title, salary, department_id) values ('Salesperson', 80000, 1)",
        "insert into role(title, salary, department_id) values ('Lead Engineer', 150000, 2)",
        "insert into role(title, salary, department_id) values ('Account Manager', 160000, 2)",
        "insert into employee(first_name, last_name, role_id) values ('John','Doe', 1)",
        "insert into employee(first_name, last_name, role_id, manager_id) values ('Mike','Chan', 2, 1)",
        "insert into employee(first_name, last_name, role_id) values ('Ashley','Rudriguez', 3)",
    ]

    for(var i = 0; i < queries.length; i++){
        connection.query(queries[i], (err, result)=>{
            if (err) throw err
        })
    }
}

module.exports = seed;