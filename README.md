# Date input
A date input field for web

## Install
Require jquery and momentjs

### Bower
`bower install date-input`

Import libraries to your web
 ```html
<link href="bower_components/date-input/src/dateinput.css" rel="stylesheet">
<script src="bower_components/date-input/src/dateinput.js"></script>
<!-- If you have use bootstrap, do not add below file -->
<script src="bower_components/date-input/src/dateinput_theme.js"></script>
 ```

## Usage
Just simple with use `.dateInput()`
```html
<input id="mydateinput" type="text" />

<script type="text/javascript">
$(function() {
    $("#mydateinput").dateInput();
});
</script>
```
Click the input field and you will see a picker will pop up

### Options
```javascript
{
    // Press prev or next button delay repeat (Default: 300)
    pressDelay: {milliseconds},
    // Press prev or next button repeat rate (Default: 100)
    pressRepeatRate: {milliseconds}
}
```
Example:
```html
<script>
var dateOpts = {
    pressDelay: 1000,
    pressRepeatRate: 50
};
$("#mydateinput").dateInput(dateOpts);
</script>
```

## Develop
Develop by: @OnikurYH

## License
MIT License

Copyright (c) 2015 OnikurYH
