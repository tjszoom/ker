package cn.kkmofang.ker;

import android.content.Context;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.util.AttributeSet;
import android.view.View;
import android.view.ViewGroup;

/**
 * Created by zhanghailong on 2018/12/14.
 */

public class KerView extends ViewGroup implements IKerView {

    public KerView(Context context) {
        super(context);
        init();
    }

    public KerView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    protected void init() {
        setOverScrollMode(View.OVER_SCROLL_NEVER);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {

        int width = getDefaultSize(Integer.MAX_VALUE,widthMeasureSpec);
        int height = getDefaultSize(Integer.MAX_VALUE,heightMeasureSpec);

        Rect frame = (Rect) getTag(R.id.ker_frame);

        if(frame != null) {
            width = frame.width;
            height = frame.height;
        }

        setMeasuredDimension(width, height);

        int parentWidthSpec = MeasureSpec.makeMeasureSpec(width, MeasureSpec.AT_MOST);
        int parentHeightSpec = MeasureSpec.makeMeasureSpec(height, MeasureSpec.AT_MOST);

        int childCount = getChildCount();
        for (int i = 0; i < childCount; i++) {
            View v = getChildAt(i);
            if (v != null && v.getVisibility() != GONE){
                measureChild(v, parentWidthSpec, parentHeightSpec);
            }
        }

    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int count = getChildCount();

        for(int i=0;i<count;i++) {

            View v = getChildAt(i);

            if(v != null && v.getVisibility() == View.VISIBLE) {

                Rect frame = (Rect) v.getTag(R.id.ker_frame);

                if(frame != null) {
                    v.layout(frame.x,frame.y,frame.x + frame.width,frame.y + frame.height);
                } else {
                    v.layout(l,t,r,b);
                }

            }

        }
    }

    @Override
    public void setViewConfiguration(long viewConfiguration) {

    }

    @Override
    public void setAttributeValue(long object, String key, String value) {
        setAttributeValue(this,object,key,value);
    }

    private static void updateViewBackground(View view) {
        GradientDrawable bg;
        if(view.getBackground() != null && view.getBackground() instanceof GradientDrawable) {
            bg = (GradientDrawable) view.getBackground();
        } else {
            bg = new GradientDrawable();
        }

        int bgColor =  Ker.intValue(view.getTag(R.id.ker_background_color),0);
        int color = Ker.intValue(view.getTag(R.id.ker_border_color),0);
        int width = Ker.intValue(view.getTag(R.id.ker_border_width),0);
        int radius = Ker.intValue(view.getTag(R.id.ker_border_radius),0);

        bg.setStroke(width,color);
        bg.setCornerRadius(radius);
        bg.setColor(bgColor);

        view.setBackground(bg);
    }

    public static void setAttributeValue(View view,long object, String key, String value) {

        if("background-color".equals(key)) {
            view.setTag(R.id.ker_background_color,Ker.colorValue(value,0));
            updateViewBackground(view);
        } else if("hidden".equals(key)) {
            if(Ker.booleanValue(value,false)) {
                view.setVisibility(View.GONE);
            } else {
                view.setVisibility(View.VISIBLE);
            }
        } else if("border-width".equals(key)) {
            view.setTag(R.id.ker_border_width,Ker.intValue(value,0));
            updateViewBackground(view);
        } else if("border-color".equals(key)) {
            view.setTag(R.id.ker_border_color,Ker.colorValue(value,0));
            updateViewBackground(view);
        } else if("border-radius".equals(key)) {
            view.setTag(R.id.ker_border_radius,Ker.intValue(value,0));
            updateViewBackground(view);
        }

    }

    @Override
    public void recycle(long object) {

    }

    @Override
    public void obtain(long object) {

    }

    @Override
    public void setContent(long object, String content, String contentType, String basePath) {

    }

    @Override
    public void evaluateJavaScript(long object, String evaluateCode) {

    }

    @Override
    public void setImage(Drawable image) {
        setBackground(image);
    }

    @Override
    public void setAttributedText(long object, CharSequence string) {

    }

    @Override
    public ViewGroup contentView() {
        return null;
    }
}
