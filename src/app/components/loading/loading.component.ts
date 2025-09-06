import { AfterViewInit, Component } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'msuf-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
  standalone: true
})
export class LoadingComponent implements AfterViewInit {
  ngAfterViewInit() {
    gsap.to("#leaf", {
      duration: 2,
      rotate: 5,
      transformOrigin: "50% 0%", // pivô no topo, como se fosse preso no galho
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  }
}
