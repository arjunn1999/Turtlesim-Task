document.addEventListener('DOMContentLoaded',(e)=>{
    e.preventDefault();
    let  pos_x = 0
    let pos_y = 0
    let pos_theta=0
    var ros = new ROSLIB.Ros({
        url:'ws://localhost:9090'
    });
    ros.on('connection',()=>console.log('Connected to websocket server'))
    var cmdVel = new ROSLIB.Topic({
        ros:ros,
        name:'/turtle1/cmd_vel',
        messageType:'geometry_msgs/Twist'
    });
    document.getElementById("front").addEventListener('mousedown',(e)=>{
        e.preventDefault();
        
        var twist = new ROSLIB.Message({
            linear:{
                x:1.0,
                y:0.0,
                z:0.0
            },
            angular:{
                x:0.0,
                y:0.0,
                z:0.0
            }
        });
        cmdVel.publish(twist);
    });

    document.getElementById("back").addEventListener('click',(e)=>{
        e.preventDefault();
        var twist = new ROSLIB.Message({
            linear:{
                x:-1.0,
                y:0.0,
                z:0.0
            },
            angular:{
                x:0.0,
                y:0.0,
                z:0.0
            }
        });
        cmdVel.publish(twist);
    });
    document.getElementById("left").addEventListener('click',(e)=>{
        e.preventDefault();
        var twist = new ROSLIB.Message({
            linear:{
                x:0.0,
                y:0.0,
                z:0.0
            },
            angular:{
                x:0.0,
                y:0.0,
                z:1.0
            }
        });
        cmdVel.publish(twist);
    });
    document.getElementById("right").addEventListener('click',(e)=>{
        e.preventDefault();
        var twist = new ROSLIB.Message({
            linear:{
                x:0.0,
                y:0.0,
                z:0.0
            },
            angular:{
                x:0.0,
                y:0.0,
                z:-1.0
            }
        });
        cmdVel.publish(twist);
    });
    var pose = new ROSLIB.Topic({
        ros:ros,
        name:'/turtle1/pose',
        messageType:'turtlesim/Pose'
    });

    pose.subscribe((message)=>{
       
        let s=`x:${message['x']}\ny:${message['y']}\ntheta:${message['theta']}\nlinear velocity:${message['linear_velocity']}\nangular velocity:${message['angular_velocity']}`;
        document.getElementById('data').innerText=s

    });
    document.getElementById('location').addEventListener('submit',(e)=>{
        e.preventDefault();
        let goal_x = parseFloat(e.target[0].value);
        let goal_y = parseFloat(e.target[1].value);
        let goal_theta = parseFloat(e.target[2].value);
        let tolerance = parseFloat(e.target[3].value);

        let euclidean_dist = (x,y) => (Math.sqrt(Math.pow((x-pos_x),2)+Math.pow((y-pos_y),2)));
        let steering_angle = (x,y) => (Math.atan(x-pos_x,y-pos_y));
        let linear_vel = (x,y,constant=0.5) => (constant*euclidean_dist(x,y))
        let angular_vel = (x,y,constant=0.2)=>(constant*(steering_angle(x,y)-pos_theta))
        var cmdVel_1 = new ROSLIB.Topic({
            ros:ros,
            name:'/turtle1/cmd_vel',
            messageType:'geometry_msgs/Twist'
        });
        var twist = new ROSLIB.Message({
            linear:{
                x:0.0,
                y:0.0,
                z:0.0
            },
            angular:{
                x:0.0,
                y:0.0,
                z:0.0
            }
        });
        var pos = new ROSLIB.Topic({
            ros:ros,
            name:'/turtle1/pose',
            messageType:'turtlesim/Pose'
        });
        pos.subscribe((message)=>{
            pos_x=parseFloat(message['x'])
            pos_y=parseFloat(message['y'])
            if(euclidean_dist(goal_x,goal_y)>=tolerance){
                twist.linear.x=linear_vel(goal_x,goal_y);
                twist.angular.z=angular_vel(goal_x,goal_y);
                cmdVel_1.publish(twist);
                console.log(pos_x,pos_y)
    
                setTimeout(()=>{},20000)
            }
            else{
            twist.linear.x=0;
            twist.angular.z=0;
            cmdVel_1.publish(twist)
            pos.unsubscribe();
            }
        });
       
        
        

    })
});