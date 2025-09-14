import PrimaryButton from "@/components/common/ui/buttons/PrimaryButton";

function List({label,content,buttonLabel,buttonLink,buttonOnClick}) {
  return (<>
  <div class="list-block flex justify-between	 w-full">
          <div className="Left">
            <div className="Title text-xl font-bold">{label}</div>
            <div className="text-md">
              {content}
            </div>
          </div>
          <div className="Right">
            <PrimaryButton onClick={buttonOnClick} content={buttonLabel} link={buttonLink}></PrimaryButton>
          </div>
        </div>
  </>
  );
}

export default List;
