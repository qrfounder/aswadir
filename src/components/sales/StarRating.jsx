export default function StarRating({ rating = 5, size = "md" }) {
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-xl", xl: "text-2xl" };
  return (
    <span className={`star-gold ${sizes[size]}`} aria-label={`${rating} نجوم`}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    </span>
  );
}