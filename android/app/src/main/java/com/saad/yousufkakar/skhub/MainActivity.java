package com.saad.yousufkakar.skhub;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.graphics.Color;
import android.graphics.Typeface;
import android.view.Gravity;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final String HOME = "https://habibullah-hub.github.io/SAAD-YOUSUF-KAKAR-Ultimate-/browser.html";
    private WebView web;
    private EditText address;
    private final int navy = Color.rgb(7, 20, 33);
    private final int teal = Color.rgb(105, 230, 211);

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(navy);
        getWindow().setNavigationBarColor(navy);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(navy);

        LinearLayout top = new LinearLayout(this);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(dp(12), dp(9), dp(12), dp(9));
        top.setBackgroundColor(navy);
        TextView logo = new TextView(this);
        logo.setText("SK✦");
        logo.setTextColor(teal);
        logo.setTextSize(20);
        logo.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        top.addView(logo, new LinearLayout.LayoutParams(dp(48), dp(44)));

        address = new EditText(this);
        address.setSingleLine(true);
        address.setTextSize(14);
        address.setHint("Search Google or enter website");
        address.setHintTextColor(Color.LTGRAY);
        address.setTextColor(Color.WHITE);
        address.setSelectAllOnFocus(true);
        address.setImeOptions(EditorInfo.IME_ACTION_GO);
        address.setBackgroundTintList(android.content.res.ColorStateList.valueOf(teal));
        top.addView(address, new LinearLayout.LayoutParams(0, dp(44), 1));

        Button go = button("GO");
        top.addView(go, new LinearLayout.LayoutParams(dp(54), dp(44)));
        root.addView(top);

        web = new WebView(this);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        if (Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();
                if ("https".equals(scheme)) return false;
                if ("http".equals(scheme)) {
                    view.loadUrl("https://" + uri.getHost() + (uri.getPort() > 0 ? ":" + uri.getPort() : "") + (uri.getPath() == null ? "" : uri.getPath()) + (uri.getQuery() == null ? "" : "?" + uri.getQuery()));
                    return true;
                }
                if ("market".equals(scheme) || "mailto".equals(scheme) || "tel".equals(scheme)) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {}
                    return true;
                }
                return true;
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) { address.setText(url); }
            @Override public void onPageFinished(WebView view, String url) { address.setText(url); }
        });
        root.addView(web, new LinearLayout.LayoutParams(-1, 0, 1));

        LinearLayout nav = new LinearLayout(this);
        nav.setPadding(dp(8), dp(5), dp(8), dp(5));
        nav.setBackgroundColor(navy);
        Button back = button("‹");
        Button forward = button("›");
        Button home = button("⌂");
        Button refresh = button("↻");
        nav.addView(back, new LinearLayout.LayoutParams(0, dp(46), 1));
        nav.addView(forward, new LinearLayout.LayoutParams(0, dp(46), 1));
        nav.addView(home, new LinearLayout.LayoutParams(0, dp(46), 1));
        nav.addView(refresh, new LinearLayout.LayoutParams(0, dp(46), 1));
        root.addView(nav);
        setContentView(root);

        go.setOnClickListener(v -> navigateFromAddress());
        address.setOnEditorActionListener((v, action, event) -> {
            if (action == EditorInfo.IME_ACTION_GO || action == EditorInfo.IME_ACTION_DONE) { navigateFromAddress(); return true; }
            return false;
        });
        back.setOnClickListener(v -> { if (web.canGoBack()) web.goBack(); });
        forward.setOnClickListener(v -> { if (web.canGoForward()) web.goForward(); });
        home.setOnClickListener(v -> web.loadUrl(HOME));
        refresh.setOnClickListener(v -> web.reload());
        if (state == null) web.loadUrl(HOME);
        else web.restoreState(state);
    }

    private void navigateFromAddress() {
        String q = address.getText().toString().trim();
        if (q.isEmpty()) return;
        String url;
        if (q.matches("(?i)^https?://.*")) url = q;
        else if (q.matches("(?i)^[a-z0-9.-]+\\.[a-z]{2,}(/.*)?$")) url = "https://" + q;
        else url = "https://www.google.com/search?q=" + Uri.encode(q);
        ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE)).hideSoftInputFromWindow(address.getWindowToken(), 0);
        web.loadUrl(url);
    }

    private Button button(String label) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextColor(teal);
        b.setTextSize(13);
        b.setAllCaps(false);
        b.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(20, 45, 64)));
        return b;
    }
    private int dp(int v) { return (int)(v * getResources().getDisplayMetrics().density + 0.5f); }
    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); if (web != null) web.saveState(out); }
    @Override public void onBackPressed() { if (web != null && web.canGoBack()) web.goBack(); else super.onBackPressed(); }
    @Override protected void onDestroy() { if (web != null) { web.stopLoading(); web.destroy(); web = null; } super.onDestroy(); }
}
