export const Hero = ({
  heading,
  subheading,
}: {
  heading: string;
  subheading?: string;
}) => {
  return (
    <section className="py-20 text-center">
      <h1 className="text-4xl font-bold">{heading}</h1>
      {subheading && (
        <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
      )}
    </section>
  );
};

export const Testimonial = () => <div>Testimonial</div>;
export const Cta = () => <div>Cta</div>;
export const FeatureGrid = () => <div>FeatureGrid</div>;
