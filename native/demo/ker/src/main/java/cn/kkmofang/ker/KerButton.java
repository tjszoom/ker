package cn.kkmofang.ker;

import android.content.Context;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Created by hailong11 on 2018/12/17.
 */

public class KerButton extends KerView implements IKerView {

    public KerButton(Context context) {
        super(context);
    }

    public KerButton(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    private long _kerObject = 0;
    private float _touchX = 0;
    private float _touchY = 0;

    protected boolean touch(MotionEvent event) {

        if(_kerObject == 0) {
            return false;
        }

        String type = "touchmove";

        boolean hasTap = false;

        switch (event.getActionMasked()) {
            case MotionEvent.ACTION_DOWN:
            case MotionEvent.ACTION_POINTER_DOWN:
                type = "touchstart";
                _touchX = event.getX();
                _touchY = event.getY();
                break;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_POINTER_UP:
                type = "touchend";
                hasTap = _touchX >=0 && _touchX < getWidth() && _touchY >=0 && _touchY < getHeight();
                break;
            case MotionEvent.ACTION_MOVE:
                type = "touchmove";
                _touchX = event.getX();
                _touchY = event.getY();
                break;
            default:
                type = "touchcancel";
                break;
        }

        Map<String,Object> data = new TreeMap<>();

        data.put("timestamp",event.getEventTime());

        List<Object> touches = new ArrayList<>();

        for(int i=0;i<event.getPointerCount();i++) {
            Map<String,Object> touch = new TreeMap<>();

            touch.put("id",String.valueOf(event.getPointerId(i)));
            touch.put("x",event.getX(i));
            touch.put("y",event.getY(i));

            if(i == event.getActionIndex()) {
                touch.put("type",type);
            } else {
                touch.put("type","move");
            }

            touches.add(touch);
        }

        data.put("touches",touches);

        Native.emit(_kerObject,type,data);

        if(hasTap) {
            Native.emit(_kerObject,"tap",data);
        }

        return true;
    }

    @Override
    public void setViewConfiguration(long viewConfiguration) {
        super.setViewConfiguration(viewConfiguration);

        final WeakReference<KerButton> v = new WeakReference<>(this);

        setOnTouchListener(new OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                KerButton b = v.get();
                if(b != null) {
                    return b.touch(motionEvent);
                }
                return false;
            }
        });

    }

    public void recycle(long object) {
        if(_kerObject == object) {
            _kerObject = 0;
        }
        super.recycle(object);
    }

    public void obtain(long object) {
        _kerObject = object;
        super.obtain(object);
    }

}
