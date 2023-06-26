import { Component, AfterViewInit, ElementRef, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  canvas: any;
  ctx: any;

  username: string; 
  password: string; 


  constructor(private elementRef: ElementRef, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.canvas = this.elementRef.nativeElement.querySelector('#background');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.backgroundAnimation();
  }

  login() {
    this.http.post('/api/login', { username: this.username, password: this.password }).subscribe(response => {
      console.log(response);
      if (response['status'] === 'success') {
        this.router.navigate(['/dash']);
      }
    }, error => {
      if (error.status === 401) {
        // Authentification failed
        window.alert('Erreur d\'authentification. Veuillez vérifier votre nom d\'utilisateur et mot de passe.');
      } else {
        // Other errors
        console.error(error);
      }
    });    
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.canvas.width = event.target.innerWidth;
    this.canvas.height = event.target.innerHeight;
  }

  backgroundAnimation() {
    const particles = [];
    const numParticles = 600;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 0.5 + 0.5;
        this.speedX = Math.random() * 2 - 1.5;
        this.speedY = Math.random() * 2 - 1.5;
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.x += this.speedX;
        this.y += this.speedY;
      
        // Vérifie si la particule est hors de l'écran et la replace de l'autre côté
        if (this.x < 0) {
          this.x = canvasWidth;
        } else if (this.x > canvasWidth) {
          this.x = 0;
        }
        if (this.y < 0) {
          this.y = canvasHeight;
        } else if (this.y > canvasHeight) {
          this.y = 0;
        }
      }
      
      draw(ctx: any) {
        //console.log('Drawing particle:', this);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();
      }
    }

    const connectParticles = () => {
      const particlesDistance = 100;
      for (let a = 0; a < numParticles; a++) {
        for (let b = a; b < numParticles; b++) {
          if (particles[a] && particles[b]) { // Ajout de cette ligne pour vérifier si les particules existent
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            if (distance < particlesDistance) {
              this.ctx.beginPath();
              this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
              this.ctx.lineWidth = 1.5;
              this.ctx.moveTo(particles[a].x, particles[a].y);
              this.ctx.lineTo(particles[b].x, particles[b].y);
              this.ctx.stroke();
              this.ctx.closePath();
            }
          }
        }
      }
    };
    
    

    const initParticles = () => {
      for (let i = 0; i < numParticles; i++) {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        particles.push(new Particle(x, y));
      }
    };

    const animateParticles = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let particlesToRemove = [];
      for (let particle of particles) {
        particle.update(this.canvas.width, this.canvas.height); // Ajout des paramètres
        particle.draw(this.ctx);
    
        if (particle.size <= 0.2) {
          particlesToRemove.push(particle);
        }
      }
      for (let particle of particlesToRemove) {
        const index = particles.indexOf(particle);
        if (index !== -1) {
          particles.splice(index, 1);
        }
      }
      connectParticles();
      requestAnimationFrame(animateParticles);
    };

    initParticles();
animateParticles();
  }
}    
