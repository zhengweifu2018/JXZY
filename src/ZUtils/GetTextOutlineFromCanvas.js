import fabric from 'fabric';

export const GetTextStandardOutlineFromCanvas = (word = 'f', fontFamily = 'Comic Sans', fontWeight = 'normal', fontSize = 50, outlineSize = 5) => {
    let result = {
        outerDataUrl: null,
        innerDataUrl: null,
        outerInnerDataUrl: null
    };

    let canvas = document.createElement('canvas');
    const w = (fontSize + outlineSize * 2) * 2;
    let fabricCanvas = new fabric.Canvas(canvas, {
        backgroundColor: '#fff',
        width: w,
        height: w,
        enableRetinaScaling: false
    });

    let textOuter = new fabric.Text(word, {
        fontFamily: fontFamily,
        fill: '#000',
        fontWeight: fontWeight,
        fontSize: fontSize,
        stroke: '#000',
        strokeWidth: outlineSize * 2
    });

    let textInner = new fabric.Text(word, {
        left: outlineSize,
        top: outlineSize,
        fontFamily: fontFamily,
        fill: '#fff',
        fontWeight: fontWeight,
        fontSize: fontSize
    });

    let textGroup  = new fabric.Group([textOuter, textInner]);

    textGroup.setScaleY(-1);

    fabricCanvas.centerObject(textGroup);

    textGroup.setCoords();

    fabricCanvas.add(textGroup);
    fabricCanvas.renderAll();
    result.outerInnerDataUrl = fabricCanvas.toDataURL();

    textInner.setFill('#000');
    fabricCanvas.renderAll();
    result.outerDataUrl = fabricCanvas.toDataURL();

    textOuter.setVisible(false);
    fabricCanvas.renderAll();
    result.innerDataUrl = fabricCanvas.toDataURL();

    // document.body.appendChild(canvas);

    return result;
};

export const GetTextSpecialOutlineFromCanvas = (openTypeFont, words = 'f', fontSize = 50, outlineSize = 5) => {
    let result = {
        outerDataUrl: null,
        innerDataUrl: null,
        outerInnerDataUrl: null
    };

    let canvas = document.createElement('canvas');
    const w = (fontSize + outlineSize * 2) * 2;
    let fabricCanvas = new fabric.Canvas(canvas, {
        backgroundColor: '#fff',
        width: w,
        height: w,
        enableRetinaScaling: false
    });

    const fontPath = openTypeFont.getPath(words, 0, 0, fontSize);

    const fontPathString = fontPath.toPathData();

    // console.log(fontPathString);

    let textOuter = new fabric.Path(fontPathString, {
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        fill: '#000',
        stroke: '#000',
        strokeWidth: outlineSize * 2
    });

    let textInner = new fabric.Path(fontPathString, {
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        fill: '#fff'
    });

    textInner.set({left: textInner.left + outlineSize, top: textInner.top + outlineSize});

    let textGroup  = new fabric.Group([textOuter, textInner]);

    textGroup.setScaleY(-1);

    fabricCanvas.centerObject(textGroup);

    textGroup.setCoords();

    fabricCanvas.add(textGroup);
    fabricCanvas.renderAll();
    result.outerInnerDataUrl = fabricCanvas.toDataURL();

    textInner.setFill('#000');
    fabricCanvas.renderAll();
    result.outerDataUrl = fabricCanvas.toDataURL();

    textOuter.setVisible(false);
    fabricCanvas.renderAll();
    result.innerDataUrl = fabricCanvas.toDataURL();

    // document.body.appendChild(canvas);

    return result;
};

