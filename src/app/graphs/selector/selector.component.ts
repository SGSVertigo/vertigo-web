import { Component, OnInit, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { Dataspec } from '../../processing/dataspec';
import { Column } from '../../processing/column';
import { DataType } from '../../processing/datatype';



@Component({
  selector: 'selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class SelectorComponent implements OnInit {

  constructor() { }

  public Dataspec:Dataspec = new Dataspec();
  public SelectedValue:any;
  public SelectedValues:DataType[] = [];
  @Output() SelectionChanged = new EventEmitter<DataType[]>();

  ngOnInit() {
  }
  
  ngOnChanges(changes: SimpleChanges){
    //console.log(this.SelectedValue);
  }

  public selectionChanged(event:any){
    let DataTypes:DataType[] = [];
    Object.values(event).forEach(v=>{
      let key:any = (<any>v).value.split(":")[1].trim().replace('\'','').replace('\'','').split(",");
      let group:DataType = this.Dataspec.Types.find(t=>t.Id===key[0]);
      let col:Column = group.Columns.find(d=>d.Id===key[1]);
      if (DataTypes.find(t=>t.Id===key[0])){
        DataTypes.find(t=>t.Id===key[0]).Columns.push(col);
      } else {
        let newDataType:DataType = new DataType().from(group);
        newDataType.Columns = [];
        newDataType.Columns.push(col);
        DataTypes.push(newDataType);
      }
    });
    this.SelectedValues = DataTypes;
    this.SelectionChanged.emit(this.SelectedValues);
  }

}