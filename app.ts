const canvas = <HTMLCanvasElement>document.getElementById("canvas")
const c = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

c.fillStyle = "white"

const mouse = {
    x: undefined,
    y: undefined,
}

canvas.addEventListener("mousemove", (e) =>{
    mouse.x = e.clientX
    mouse.y = e.clientY
})

const mouseCircle = () =>{
    const radius = 50

    c.save()
    c.beginPath()
    c.arc(mouse.x, mouse.y, radius, 0, Math.PI*2)
    c.strokeStyle = "rgba(255, 0, 0, 0.1)"
    c.stroke()
    c.closePath()
    c.restore()

    return {
        x: mouse.x,
        y: mouse.y,
        radius: radius,
        mass: 1, 
        velocity: {
            x: 5,
            y: 5
        }
    }
}

const getDistance = (x1: number, y1: number, x2: number, y2: number) =>{
    const x = x1 - x2
    const y = y1 - y2
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
}

const generateRandomNum = (num1, num2) =>{
    const randomNum = Math.floor(Math.random() * num1) + num2
    if(randomNum === 0){
        generateRandomNum(num1, num2)
        return
    }else{
        return randomNum
    }
}

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

let circles = [];

class Circle{
    x = undefined;
    y = undefined;
    radius = undefined;
    color = "blue"
    velocity = {
        x: (Math.random() * 10) - 5,
        y: (Math.random() * 10) - 5,
    }
    mass = 1

    constructor(x: number, y: number, radius: number){
        this.x = x
        this.y = y
        this.radius = radius
    }

    draw = () =>{
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
    }

    update = () =>{
        this.draw()

        for(let i = 0; i < circles.length; i++){
            if(circles[i] === this) continue
            if(getDistance(this.x, this.y, circles[i].x, circles[i].y) <= (this.radius + circles[i].radius)){
                resolveCollision(this, circles[i])
            }
        }

        const preVelocity = { ...this.velocity }
        if(getDistance(this.x, this.y, mouse.x, mouse.y) < (this.radius + mouseCircle().radius)){
            this.color = "red"
        }else{
            this.color = "blue"
        }

        if((this.x < this.radius) || (this.x > (window.innerWidth - this.radius))){
            this.velocity.x *= -1
        }
        if((this.y < this.radius) || (this.y > (window.innerHeight - this.radius))){
            this.velocity.y *= -1
        }

        this.x = this.velocity.x + this.x
        this.y = this.velocity.y + this.y
    }
}

for(let i = 0; i <= 100; i++){
    let radius = 30/* Math.random() * 30 + 20 */
    let x = (Math.random() * (innerWidth - radius*2)) + radius
    let y = (Math.random() * (innerHeight - radius*2)) + radius
    
    if(i !== 0){
        for(let j = 0; j < circles.length; j++){
            if(getDistance(x, y, circles[j].x, circles[j].y) <= (radius + circles[j].radius)){
                x = (Math.random() * (innerWidth - radius*2)) + radius
                y = (Math.random() * (innerHeight - radius*2)) + radius
                j = -1
            }
        }
    }
    const circle = new Circle(x, y, radius)
    circles.push(circle)
}

const animate = () =>{
    c.clearRect(0, 0, canvas.width, canvas.height)
    circles.forEach((circle) =>{
        circle.update()
    })
    mouseCircle()
    requestAnimationFrame(animate)
}

animate()

