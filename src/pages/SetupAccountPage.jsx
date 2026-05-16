import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Lock, Mail, User, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const ERROR_MESSAGES = {
  email_in_use: "هذا الإيميل مسجّل مسبقاً. سجّل دخولك أو استخدم إيميلاً آخر.",
  payment_not_confirmed: "لم نؤكد الدفع بعد. انتظر دقيقة وحاول مرة ثانية.",
  purchase_not_found: "ما لقينا عملية الدفع. تواصل مع الدعم مع رقم الطلب.",
  purchase_already_claimed: "هذا الطلب مربوط بحساب آخر.",
  payment_intent_required: "رابط غير مكتمل. افتح الرابط من صفحة الشكر بعد الدفع.",
  weak_password: "كلمة المرور لازم 8 أحرف على الأقل.",
  invalid_email: "اكتب إيميلاً صحيحاً.",
};

export default function SetupAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isAuthenticated } = useAuth();

  const paymentIntentId =
    searchParams.get("payment_intent") || searchParams.get("pi") || "";

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!paymentIntentId) {
      setError(ERROR_MESSAGES.payment_intent_required);
      return;
    }
    if (form.password !== form.confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        paymentIntentId,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const code = err.data?.error;
      setError(ERROR_MESSAGES[code] || "صار خطأ. حاول مرة ثانية.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-cairo" dir="rtl">
      <div className="max-w-md mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3">
          <img src="/logo.png" alt="" className="w-14 h-14 rounded-xl mx-auto ring-1 ring-yellow-400/30" />
          <h1 className="text-2xl font-black text-white">أنشئ حسابك في مسار</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            خطوة واحدة وتدخل منطقة الأعضاء — نظامك، تحديثاتك، ومنتجاتك الجديدة من مكان واحد.
          </p>
        </div>

        {!paymentIntentId && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 text-amber-100 text-sm">
            افتح هذه الصفحة من رابط «إنشاء الحساب» بعد الدفع. إذا دفعت سابقاً،{" "}
            <Link to="/login" className="text-yellow-400 font-bold hover:underline">
              سجّل دخولك
            </Link>{" "}
            واربط طلبك من هناك.
          </div>
        )}

        <form onSubmit={handleSubmit} className="dark-card rounded-2xl p-6 space-y-5">
          <label className="block">
            <span className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-yellow-400" /> الاسم الكامل
            </span>
            <input
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-yellow-400" /> الإيميل (لتسجيل الدخول)
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-white outline-none text-left"
            />
          </label>

          <label className="block">
            <span className="text-gray-300 text-sm font-bold mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-400" /> كلمة المرور
            </span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="text-gray-300 text-sm font-bold mb-2">تأكيد كلمة المرور</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              className="w-full bg-black/40 border border-gray-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-white outline-none"
            />
          </label>

          {error && (
            <div className="bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !paymentIntentId}
            className="cta-button w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> جاري الإنشاء...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> ادخل إلى لوحة التحكم
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          عندك حساب؟{" "}
          <Link to="/login" className="text-yellow-400 font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
