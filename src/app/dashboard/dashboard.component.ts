import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {ElementRef,Renderer2} from '@angular/core';
import { FileParser } from '../shared/fileparser';

@Component({
  templateUrl: 'dashboard.component.html'
})

export class DashboardComponent implements OnInit {

  constructor(mainChart: ElementRef) { 
    this.mainChart = mainChart;
  }

  public mainChart : ElementRef;

  public brandPrimary = '#20a8d8';
  public brandSuccess = '#4dbd74';
  public brandInfo = '#63c2de';
  public brandWarning = '#f8cb00';
  public brandDanger = '#f86c6b';

  // dropdown buttons
  public status: { isopen } = { isopen: false };
  public toggleDropdown($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }

  // convert Hex to RGBA
  public convertHex(hex: string, opacity: number) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const rgba = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity / 100 + ')';
    return rgba;
  }

  // mainChart
  private text: string;

  readSingleFile(inputField) {
      var fileName = inputField.files[0];
      if (!fileName) {
          alert("No file selected");
          return;
      }
      var reader = new FileReader();
      reader.onload = file => {
          var contents: any = file.target;
          this.text = contents.result;
          console.log("Loaded file");
          let fp:FileParser = new FileParser();
          var parsedFile = fp.parseFile(this.text);
          var ax:any = fp.parseArray(parsedFile,2,1);
          var ay:any = fp.parseArray(parsedFile,2,2);
          var az:any = fp.parseArray(parsedFile,2,3);
          var iax:any = this.integrate(ax);
          var iay:any = this.integrate(ay);
          var iaz:any = this.integrate(az);
          var rx:any = fp.parseArray(parsedFile,2,4);
          var ry:any = fp.parseArray(parsedFile,2,5);
          var rz:any = fp.parseArray(parsedFile,2,6);
          var x:any = fp.parseArray(parsedFile,1,1);
          var y:any = fp.parseArray(parsedFile,1,2);
          var z:any = fp.parseArray(parsedFile,1,3);
          var q0:any = fp.parseArray(parsedFile,3,1);
          var q1:any = fp.parseArray(parsedFile,3,2);
          var q2:any = fp.parseArray(parsedFile,3,3);
          var q3:any = fp.parseArray(parsedFile,3,4);
          var accelerationVector:Array<any> = [ax,ay,az];
          var angularAccelerationVector:Array<any> = [rx,ry,rz];
          var quaternion:Array<any> = [q0,q1,q2,q3];
          var correctedAcceleration:Array<any> = this.convertDataToWorldReference(accelerationVector,quaternion);
          var correctedAngularAcceleration:Array<any> = this.convertDataToWorldReference(angularAccelerationVector,quaternion);
          this.worldReferenceAccelerationChartData = [
            {
              data: correctedAcceleration[0],
              label: 'X'
            },
            {
              data: correctedAcceleration[1],
              label: 'Y'
            },
            {
              data: correctedAcceleration[2],
              label: 'Z'
            }
          ];
          this.worldReferenceAngularAccelerationChartData = [
            {
              data: correctedAngularAcceleration[0],
              label: 'X'
            },
            {
              data: correctedAngularAcceleration[1],
              label: 'Y'
            },
            {
              data: correctedAngularAcceleration[2],
              label: 'Z'
            }
          ];
          this.accelerationChartData = [
            {
              data: ax,
              label: 'X'
            },
            {
              data: ay,
              label: 'Y'
            },
            {
              data: az,
              label: 'Z'
            }
          ];
          this.accelerationIntegralChartData = [
            {
              data: iax,
              label: 'X'
            },
            {
              data: iay,
              label: 'Y'
            },
            {
              data: iaz,
              label: 'Z'
            }
          ];
          this.angularAccelerationChartData = [
            {
              data: rx,
              label: 'X'
            },
            {
              data: ry,
              label: 'Y'
            },
            {
              data: rz,
              label: 'Z'
            }
          ];
          this.worldReferenceAccelerationChartData = [
            {
              data: correctedAcceleration[0],
              label: 'X'
            },
            {
              data: correctedAcceleration[1],
              label: 'Y'
            },
            {
              data: correctedAcceleration[2],
              label: 'Z'
            }
          ];
          this.positionChartData = [
            {
              data: z,
              label: 'Z'
            }
          ];
        };
      reader.readAsText(fileName);
  }

  private integrate(any:any):any{
    var lastX:number = any[0].x;
    var lastY:number = any[0].y;
    var output = [];
    var last:number = 0;
    any.forEach(element => {
      var diff:number = ((parseFloat(element.y)+lastY)*(parseFloat(element.x)-lastX)/2.0);
      if (isNaN(diff)){
        diff = 0;
      }
      output.push({x:element.x,y:last+diff});
      last = last+diff;
      lastX = parseFloat(element.x);
      lastY = parseFloat(element.y);
    });
    return output;
  }

  private convertDataToWorldReference(data:Array<any>,quaternion:Array<any>):Array<any>{
    var output:Array<any> = [[],[],[]];
    var endIndex = data[0].length;
    if (quaternion[0].length< endIndex){
      endIndex = quaternion[0].length;
    }

    for (var i = 0; i < endIndex; i++){
      var vector:Array<number> = [parseFloat(data[0][i].y),parseFloat(data[1][i].y),parseFloat(data[2][i].y)];
      var thisQuaternion:Array<number> = [parseFloat(quaternion[0][i].y),parseFloat(quaternion[1][i].y),parseFloat(quaternion[2][i].y),parseFloat(quaternion[3][i].y)];
      var correctedVector:Array<number> = this.toWorldReference(vector,thisQuaternion);
      output[0].push({x:data[0][i].x,y:correctedVector[0]});
      output[1].push({x:data[0][i].x,y:correctedVector[1]});
      output[2].push({x:data[0][i].x,y:correctedVector[2]});
    }
    return output;
  }

  private toWorldReference(vector:Array<number>,quaternion:Array<number>):Array<number>{
    var outputVector:Array<number> = [0.0,vector[0],vector[1],vector[2]];
    outputVector = this.hamiltonian(quaternion,outputVector);
    outputVector = this.hamiltonian(outputVector,this.quaternionConjugate(quaternion));
    outputVector = [outputVector[1],outputVector[2],outputVector[3]];
    return outputVector;
  }

  private quaternionConjugate(q:Array<number>):Array<number>{
    var output:Array<number> = [];
    output.push( q[0]);
    output.push(-q[1]);
    output.push(-q[2]);
    output.push(-q[3]);
    return output;
  }

  private hamiltonian(q:Array<number>, r:Array<number>):Array<number>{
    var output:Array<number> = [];
    output.push(q[0]*r[0] - q[1]*r[1] - q[2]*r[2] - q[3]*r[3]);
    output.push(q[0]*r[1] + r[0]*q[1] + q[2]*r[3] - q[3]*r[2]);
    output.push(q[0]*r[2] + r[0]*q[2] + q[3]*r[1] - q[1]*r[3]);
    output.push(q[0]*r[3] + r[0]*q[3] + q[1]*r[2] - q[2]*r[1]);
    return output;
  }

  public triggerFile(fileInput:Element) {
    this.readSingleFile(fileInput);
  }

  public ax: Array<number> = [];
  public ay: Array<number> = [];
  public az: Array<number> = [];
  
  public worldReferenceAccelerationChartData: Array<any> = [
    {
      data: this.ax,
      label: 'X'
    },
    {
      data: this.ay,
      label: 'Y'
    },
    {
      data: this.az,
      label: 'Z'
    }
  ];
  public accelerationChartData: Array<any> = [
    {
      data: this.ax,
      label: 'X'
    },
    {
      data: this.ay,
      label: 'Y'
    },
    {
      data: this.az,
      label: 'Z'
    }
  ];
  public accelerationIntegralChartData: Array<any> = [
    {
      data: this.ax,
      label: 'X'
    },
    {
      data: this.ay,
      label: 'Y'
    },
    {
      data: this.az,
      label: 'Z'
    }
  ];
  public angularAccelerationChartData: Array<any> = [
    {
      data: this.ax,
      label: 'X'
    },
    {
      data: this.ay,
      label: 'Y'
    },
    {
      data: this.az,
      label: 'Z'
    }
  ];
  public worldReferenceAngularAccelerationChartData: Array<any> = [
    {
      data: this.ax,
      label: 'X'
    },
    {
      data: this.ay,
      label: 'Y'
    },
    {
      data: this.az,
      label: 'Z'
    }
  ];
  public positionChartData: Array<any> = [
    {
      data: this.az,
      label: 'Z'
    }
  ];
 
  public mainChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3,
      }
    }
  };
  public mainChartColours: Array<any> = [
    { // brandInfo
      backgroundColor: this.convertHex(this.brandInfo, 10),
      borderColor: this.brandInfo,
      pointHoverBackgroundColor: '#fff'
    },
    { // brandSuccess
      backgroundColor: 'transparent',
      borderColor: this.brandSuccess,
      pointHoverBackgroundColor: '#fff'
    },
    { // brandDanger
      backgroundColor: 'transparent',
      borderColor: this.brandDanger,
      pointHoverBackgroundColor: '#fff'
    }
  ];
  public mainChartLegend = true;
  public mainChartType = 'scatter';

  ngOnInit(): void {

  }
}