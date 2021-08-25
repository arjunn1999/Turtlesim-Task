// class TurtleBot{
//     constructor(ros){
      
//         this.velocity_pub=new ROSLIB.Topic({
//         ros:ros,
//         name:'/turtle1/cmd_vel',
//         messageType:'geometry_msgs/Twist'
//         })
//         this.pose = new ROSLIB.Topic({
//             ros:ros,
//             name:'/turtle1/pose',
//             messageType:'turtlesim/Pose'
//         });
//         this.pose_x=0;
//         this.pose_y=0;
//         this.pose_z=0;
//         this.pose.subscribe(this.update_pos);
//         this.twist = new ROSLIB.Message({
//             linear:{
//                 x:0,
//                 y:0,
//                 z:0
//             },
//             angular:{
//                 x:0,
//                 y:0,
//                 z:0
//             }
//         });
//     }
//     update_pos(data) {
//         this.pose_x=parseFloat(data['x']);
//         this.pose_y=parseFloat(data['y']);
//         this.pose_theta=parseFloat(data['theta']);
//     }
//     euclidean_dist(goal_x,goal_y){
//         let dist = Math.sqrt(Math.pow(goal_x-this.pose_x,2)+Math.pow(goal_y-this.pose_y,2));
//         return dist;
//     }
//     linear_vel(goal_x,goal_y,c=1.5){
//         let linear_vel=c*this.euclidean_dist(goal_x,goal_y);
//     }
//     steering_angle(goal_x,goal_y){
//         let angle = Math.atan(goal_x-this.pose_x,goal_y-this.goal_y);
//         return angle
//     }
//     angular_vel(goal_x,goal_y,c=6){
//         return c*(this.steering_angle(goal_x,goal_y)-this.pose_theta)
//     }

//     move2Pos(goal_x,goal_y,tolerance=0.5){
//         console.log(this.pose_x,this.pose_y)
//         while (this.euclidean_dist(goal_x,goal_y)>=tolerance){
//             this.twist.linear.x=this.linear_vel(goal_x,goal_y)
//             this.twist.angular.z=this.angular_vel(goal_x,goal_y);
//             this.velocity_pub.publish(this.twist)
//         }
//             this.twist.linear.x=0;
//             this.twist.angular.z=0
//             this.velocity_pub.publish(this.twist);
//     }


// }


document.addEventListener('DOMContentLoaded',(e)=>{
    e.preventDefault();
    var  pos_x = 0
    var pos_y = 0
    var pos_theta=0
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
       pos_x=parseFloat(message['x'])
       pos_y=parseFloat(message['y'])
       pos_theta=parseFloat(message['theta'])
        let s=`x:${message['x']}\ny:${message['y']}\ntheta:${message['theta']}\nlinear velocity:${message['linear_velocity']}\nangular velocity:${message['angular_velocity']}`;
        document.getElementById('data').innerText=s

    });
    document.getElementById('location').addEventListener('submit',(e)=>{
        e.preventDefault();

        let goal_x = parseFloat(e.target[0].value);
        let goal_y = parseFloat(e.target[1].value);
        let tolerance = parseFloat(e.target[2].value);
        let euclidean_dist = (p_x,p_y)=>(Math.sqrt(Math.pow(p_x-goal_x,2)+Math.pow(p_y-goal_y,2)));
        let linear_vel=(p_x,p_y,c=1.5)=>(c*euclidean_dist(p_x,p_y));
        let steering_angle=(p_x,p_y)=>(Math.atan2(goal_y-p_y,goal_x-p_x));
        let angular_vel=(p_x,p_y,c=6)=>(c*(steering_angle(p_x,p_y)-pos_theta));
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
           pos_theta=parseFloat(message['theta'])
            if(euclidean_dist(pos_x,pos_y)>=tolerance){
                twist.linear.x=linear_vel(pos_x,pos_y);
                console.log(pos_x,pos_y)
                twist.angular.z=angular_vel(pos_x,pos_y);
                cmdVel.publish(twist);
            }   
            if(euclidean_dist(pos_x,pos_y)<tolerance){
                twist.linear.x=0;
                twist.angular.z=0;
                cmdVel.publish(twist);
                pos.unsubscribe();
            }
    
        });

        });


    const rosout = new ROSLIB.Topic({
        ros:ros,
        name:'/rosout',
        type:'rosgraph_msgs/Log'
    });
    rosout.subscribe((e)=>{
        if(e['name']=='/turtlesim' && e['level']==4){
            vNotify.error({text:e['msg'], title:'Error Notification.'});
        }
    })
});