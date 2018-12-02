export class MapPopup
{
  public readonly position: google.maps.LatLng;
  private body: HTMLElement;

  constructor(lat: number, lng: number) {
    this.position = new google.maps.LatLng(lat, lng);

    let arrow = document.createElement('div');
    arrow.classList.add('arrow');

    let content = document.createElement('div');
    content.innerText = "Test";

    this.body = document.createElement('div');
    this.body.classList.add('map-popup');
    this.body.classList.add('active');
    this.body.appendChild(content);
    this.body.appendChild(arrow);


    // Optionally stop clicks, etc., from bubbling up to the map.
    this.stopEventPropagation();
  };

  stopEventPropagation() {
    this.body.style.cursor = 'default';

    let body = this.body;

    ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart',
     'pointerdown']
        .forEach(function(event) {
          body.addEventListener(event, function(e) {
            console.log('stopPropagation');
            e.stopPropagation();
          });
        });
  };

  // Called when the popup is added to the map.
  onAdd() {
    this.getPanes().floatPane.appendChild(this.body);
  };

  // Called when the popup is removed from the map.
  onRemove() {
    if (this.body.parentElement) {
      this.body.parentElement.removeChild(this.body);
    }
  };

  // Called when the popup needs to draw itself.
  draw() {
    var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
    // Hide the popup when it is far out of view.
    var display =
        Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
        'block' :
        'none';

    if (display === 'block') {
      this.body.style.left = (divPosition.x - this.body.offsetWidth/2)+ 'px';
      this.body.style.top = (divPosition.y - this.body.offsetHeight - 13) + 'px';
    }
    if (this.body.style.display !== display) {
      this.body.style.display = display;
    }
  };

  // Declare stubs that is overridden by google.maps.OverlayView
  getPanes() : any {}
  getProjection() : any {}
  setMap(map: google.maps.Map) {}
}
